package com.example.travelreimbursement.service;

import com.example.travelreimbursement.dto.ClaimDTO;
import com.example.travelreimbursement.dto.DailySummaryDTO;
import com.example.travelreimbursement.dto.HotelDTO;
import com.example.travelreimbursement.dto.MiscellaneousDTO;
import com.example.travelreimbursement.dto.OtherExpenseDTO;
import com.example.travelreimbursement.dto.TelephoneDTO;
import com.example.travelreimbursement.dto.TaxiDTO;
import com.example.travelreimbursement.entity.*;
import com.example.travelreimbursement.exception.InvalidOperationException;
import com.example.travelreimbursement.exception.ResourceNotFoundException;
import com.example.travelreimbursement.exception.UnauthorizedAccessException;
import com.example.travelreimbursement.repository.ApprovalRepository;
import com.example.travelreimbursement.repository.ClaimRepository;
import com.example.travelreimbursement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClaimService {
    
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final ApprovalRepository approvalRepository;
    
    public ClaimService(ClaimRepository claimRepository, UserRepository userRepository,
                        ApprovalRepository approvalRepository) {
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
        this.approvalRepository = approvalRepository;
    }
    
    public ClaimDTO createClaim(Long userId, ClaimDTO claimDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Claim claim = new Claim();
        claim.setUser(user);
        claim.setProjectName(claimDTO.getProjectName());
        claim.setTravelPurpose(claimDTO.getTravelPurpose());
        claim.setTravelFromDate(claimDTO.getTravelFromDate());
        claim.setTravelFromTime(claimDTO.getTravelFromTime());
        claim.setTravelToDate(claimDTO.getTravelToDate());
        claim.setTravelToTime(claimDTO.getTravelToTime());
        claim.setFromLocation(claimDTO.getFromLocation());
        claim.setToLocation(claimDTO.getToLocation());
        claim.setDescription(claimDTO.getDescription() != null && !claimDTO.getDescription().isBlank()
                ? claimDTO.getDescription()
                : (claimDTO.getTravelPurpose() != null && !claimDTO.getTravelPurpose().isBlank()
                    ? claimDTO.getTravelPurpose()
                    : claimDTO.getProjectName()));

        BigDecimal totalAmount = calculateTotalAmount(claimDTO);
        claim.setAmount(totalAmount.compareTo(BigDecimal.ZERO) > 0
                ? totalAmount
                : (claimDTO.getAmount() != null ? claimDTO.getAmount() : BigDecimal.ZERO));
        claim.setStatus(ClaimStatus.DRAFT);

        if (user.getManager() != null) {
            claim.setManager(user.getManager());
        }

        claim.setDailySummaryEntries(mapDailySummaryEntries(claimDTO.getDailySummary(), claim));
        claim.setHotelEntries(mapHotelEntries(claimDTO.getHotel(), claim));
        claim.setTelephoneEntries(mapTelephoneEntries(claimDTO.getTelephone(), claim));
        claim.setTaxiEntries(mapTaxiEntries(claimDTO.getTaxi(), claim));
        claim.setMiscellaneousEntries(mapMiscellaneousEntries(claimDTO.getMiscellaneous(), claim));
        claim.setOtherExpenseEntries(mapOtherExpenseEntries(claimDTO.getOtherExpenses(), claim));

        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO submitClaim(Long claimId, Long userId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        if (!claim.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You can only submit your own claims");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.DRAFT)) {
            throw new InvalidOperationException("Only draft claims can be submitted");
        }
        
        if (claim.getManager() == null) {
            throw new InvalidOperationException("User does not have a manager assigned");
        }
        
        claim.setStatus(ClaimStatus.PENDING_MANAGER_APPROVAL);
        claim.setSubmittedAt(LocalDateTime.now());
        
        Approval managerApproval = new Approval();
        managerApproval.setClaim(claim);
        managerApproval.setApprover(claim.getManager());
        managerApproval.setRole(UserRole.MANAGER);
        managerApproval.setStatus(ApprovalStatus.PENDING);
        approvalRepository.save(managerApproval);
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO approveClaim(Long claimId, Long managerId, String comments) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        if (!manager.getRole().equals(UserRole.MANAGER)) {
            throw new UnauthorizedAccessException("Only managers can approve claims");
        }
        
        if (!claim.getManager().getId().equals(managerId)) {
            throw new UnauthorizedAccessException("You can only approve claims assigned to you");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.PENDING_MANAGER_APPROVAL)) {
            throw new InvalidOperationException("Claim is not in pending manager approval status");
        }
        
        claim.setStatus(ClaimStatus.MANAGER_APPROVED);
        claim.setApprovedAt(LocalDateTime.now());
        
        Approval approval = new Approval();
        approval.setClaim(claim);
        approval.setApprover(manager);
        approval.setRole(UserRole.MANAGER);
        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setComments(comments);
        approval.setApprovedAt(LocalDateTime.now());
        approvalRepository.save(approval);
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO rejectClaim(Long claimId, Long managerId, String reason) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        if (!manager.getRole().equals(UserRole.MANAGER)) {
            throw new UnauthorizedAccessException("Only managers can reject claims");
        }
        
        if (!claim.getManager().getId().equals(managerId)) {
            throw new UnauthorizedAccessException("You can only reject claims assigned to you");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.PENDING_MANAGER_APPROVAL)) {
            throw new InvalidOperationException("Claim is not in pending manager approval status");
        }
        
        claim.setStatus(ClaimStatus.REJECTED);
        claim.setRejectionReason(reason);
        
        Approval approval = new Approval();
        approval.setClaim(claim);
        approval.setApprover(manager);
        approval.setRole(UserRole.MANAGER);
        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setComments(reason);
        approval.setApprovedAt(LocalDateTime.now());
        approvalRepository.save(approval);
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO approveBHR(Long claimId, Long hrId, String comments) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR not found with id: " + hrId));
        
        if (!hr.getRole().equals(UserRole.HR)) {
            throw new UnauthorizedAccessException("Only HR can approve claims");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.MANAGER_APPROVED)) {
            throw new InvalidOperationException("Claim must be manager approved before HR approval");
        }
        
        claim.setStatus(ClaimStatus.APPROVED);
        claim.setApprovedAt(LocalDateTime.now());
        
        Approval approval = new Approval();
        approval.setClaim(claim);
        approval.setApprover(hr);
        approval.setRole(UserRole.HR);
        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setComments(comments);
        approval.setApprovedAt(LocalDateTime.now());
        approvalRepository.save(approval);
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public ClaimDTO markAsPaid(Long claimId, Long hrId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR not found with id: " + hrId));
        
        if (!hr.getRole().equals(UserRole.HR)) {
            throw new UnauthorizedAccessException("Only HR can mark claims as paid");
        }
        
        if (!claim.getStatus().equals(ClaimStatus.APPROVED)) {
            throw new InvalidOperationException("Claim must be approved before marking as paid");
        }
        
        claim.setStatus(ClaimStatus.PAID);
        claim.setPaidAt(LocalDateTime.now());
        
        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }
    
    public List<ClaimDTO> getClaimsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return claimRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ClaimDTO> getPendingClaimsByManager(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        if (!manager.getRole().equals(UserRole.MANAGER)) {
            throw new UnauthorizedAccessException("Only managers can view pending claims");
        }
        
        return claimRepository.findByManagerIdAndStatus(managerId, ClaimStatus.PENDING_MANAGER_APPROVAL)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ClaimDTO> getClaimsByManagerForApproval(Long managerId) {
        return claimRepository.findByManagerId(managerId)
                .stream()
                .filter(claim -> !claim.getStatus().equals(ClaimStatus.DRAFT))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ClaimDTO> getAllPendingClaims() {
        return claimRepository.findByStatus(ClaimStatus.PENDING_MANAGER_APPROVAL)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ClaimDTO getClaimById(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        return convertToDTO(claim);
    }
    
    private ClaimDTO convertToDTO(Claim claim) {
        return new ClaimDTO(
                claim.getId(),
                claim.getProjectName(),
                claim.getTravelPurpose(),
                claim.getTravelFromDate(),
                claim.getTravelFromTime(),
                claim.getTravelToDate(),
                claim.getTravelToTime(),
                claim.getFromLocation(),
                claim.getToLocation(),
                claim.getDescription(),
                claim.getAmount(),
                claim.getStatus(),
                claim.getRejectionReason(),
                claim.getUser().getId(),
                claim.getManager() != null ? claim.getManager().getId() : null,
                mapDailySummaryToDTO(claim.getDailySummaryEntries()),
                mapHotelToDTO(claim.getHotelEntries()),
                mapTelephoneToDTO(claim.getTelephoneEntries()),
                mapTaxiToDTO(claim.getTaxiEntries()),
                mapMiscellaneousToDTO(claim.getMiscellaneousEntries()),
                mapOtherExpensesToDTO(claim.getOtherExpenseEntries()),
                claim.getCreatedAt(),
                claim.getSubmittedAt(),
                claim.getApprovedAt(),
                claim.getPaidAt(),
                claim.getUpdatedAt()
        );
    }

    private BigDecimal calculateTotalAmount(ClaimDTO claimDTO) {
        BigDecimal total = BigDecimal.ZERO;
        total = total.add(sumSection(claimDTO.getDailySummary()));
        total = total.add(sumSection(claimDTO.getHotel()));
        total = total.add(sumSection(claimDTO.getTelephone()));
        total = total.add(sumSection(claimDTO.getTaxi()));
        total = total.add(sumSection(claimDTO.getMiscellaneous()));
        total = total.add(sumSection(claimDTO.getOtherExpenses()));
        return total;
    }

    private BigDecimal sumSection(List<? extends Object> entries) {
        if (entries == null) {
            return BigDecimal.ZERO;
        }
        return entries.stream()
                .map(entry -> {
                    if (entry instanceof DailySummaryDTO) {
                        return getLineTotal(((DailySummaryDTO) entry).getAmount(), ((DailySummaryDTO) entry).getDays());
                    }
                    if (entry instanceof HotelDTO) {
                        return getLineTotal(((HotelDTO) entry).getAmount(), ((HotelDTO) entry).getDays());
                    }
                    if (entry instanceof TelephoneDTO) {
                        return getLineTotal(((TelephoneDTO) entry).getAmount(), ((TelephoneDTO) entry).getDays());
                    }
                    if (entry instanceof TaxiDTO) {
                        return getLineTotal(((TaxiDTO) entry).getAmount(), ((TaxiDTO) entry).getDays());
                    }
                    if (entry instanceof MiscellaneousDTO) {
                        return getLineTotal(((MiscellaneousDTO) entry).getAmount(), ((MiscellaneousDTO) entry).getDays());
                    }
                    if (entry instanceof OtherExpenseDTO) {
                        return getLineTotal(((OtherExpenseDTO) entry).getAmount(), ((OtherExpenseDTO) entry).getDays());
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal getLineTotal(BigDecimal amount, Integer days) {
        BigDecimal normalizedAmount = amount == null ? BigDecimal.ZERO : amount;
        BigDecimal normalizedDays = days == null ? BigDecimal.ZERO : BigDecimal.valueOf(days);
        return normalizedAmount.multiply(normalizedDays);
    }

    private List<DailySummaryEntry> mapDailySummaryEntries(List<DailySummaryDTO> dtos, Claim claim) {
        if (dtos == null) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(dto -> {
                    DailySummaryEntry entry = new DailySummaryEntry();
                    entry.setClaim(claim);
                    entry.setDescription(dto.getDescription());
                    entry.setAmount(dto.getAmount());
                    entry.setDays(dto.getDays());
                    entry.setTotal(getLineTotal(dto.getAmount(), dto.getDays()));
                    entry.setSectionId(UUID.randomUUID().toString());
                    return entry;
                })
                .collect(Collectors.toList());
    }

    private List<HotelEntry> mapHotelEntries(List<HotelDTO> dtos, Claim claim) {
        if (dtos == null) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(dto -> {
                    HotelEntry entry = new HotelEntry();
                    entry.setClaim(claim);
                    entry.setDescription(dto.getDescription());
                    entry.setAmount(dto.getAmount());
                    entry.setDays(dto.getDays());
                    entry.setTotal(getLineTotal(dto.getAmount(), dto.getDays()));
                    entry.setSectionId(UUID.randomUUID().toString());
                    return entry;
                })
                .collect(Collectors.toList());
    }

    private List<TelephoneEntry> mapTelephoneEntries(List<TelephoneDTO> dtos, Claim claim) {
        if (dtos == null) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(dto -> {
                    TelephoneEntry entry = new TelephoneEntry();
                    entry.setClaim(claim);
                    entry.setDescription(dto.getDescription());
                    entry.setAmount(dto.getAmount());
                    entry.setDays(dto.getDays());
                    entry.setTotal(getLineTotal(dto.getAmount(), dto.getDays()));
                    entry.setSectionId(UUID.randomUUID().toString());
                    return entry;
                })
                .collect(Collectors.toList());
    }

    private List<TaxiEntry> mapTaxiEntries(List<TaxiDTO> dtos, Claim claim) {
        if (dtos == null) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(dto -> {
                    TaxiEntry entry = new TaxiEntry();
                    entry.setClaim(claim);
                    entry.setDescription(dto.getDescription());
                    entry.setAmount(dto.getAmount());
                    entry.setDays(dto.getDays());
                    entry.setTotal(getLineTotal(dto.getAmount(), dto.getDays()));
                    entry.setSectionId(UUID.randomUUID().toString());
                    return entry;
                })
                .collect(Collectors.toList());
    }

    private List<MiscellaneousEntry> mapMiscellaneousEntries(List<MiscellaneousDTO> dtos, Claim claim) {
        if (dtos == null) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(dto -> {
                    MiscellaneousEntry entry = new MiscellaneousEntry();
                    entry.setClaim(claim);
                    entry.setDescription(dto.getDescription());
                    entry.setAmount(dto.getAmount());
                    entry.setDays(dto.getDays());
                    entry.setTotal(getLineTotal(dto.getAmount(), dto.getDays()));
                    entry.setSectionId(UUID.randomUUID().toString());
                    return entry;
                })
                .collect(Collectors.toList());
    }

    private List<OtherExpenseEntry> mapOtherExpenseEntries(List<OtherExpenseDTO> dtos, Claim claim) {
        if (dtos == null) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(dto -> {
                    OtherExpenseEntry entry = new OtherExpenseEntry();
                    entry.setClaim(claim);
                    entry.setDescription(dto.getDescription());
                    entry.setAmount(dto.getAmount());
                    entry.setDays(dto.getDays());
                    entry.setTotal(getLineTotal(dto.getAmount(), dto.getDays()));
                    entry.setSectionId(UUID.randomUUID().toString());
                    return entry;
                })
                .collect(Collectors.toList());
    }

    private List<DailySummaryDTO> mapDailySummaryToDTO(List<DailySummaryEntry> entries) {
        if (entries == null) {
            return new ArrayList<>();
        }
        return entries.stream()
                .map(entry -> {
                    DailySummaryDTO dto = new DailySummaryDTO();
                    dto.setId(entry.getId());
                    dto.setSectionId(entry.getSectionId());
                    dto.setDescription(entry.getDescription());
                    dto.setAmount(entry.getAmount());
                    dto.setDays(entry.getDays());
                    dto.setTotal(entry.getTotal());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<HotelDTO> mapHotelToDTO(List<HotelEntry> entries) {
        if (entries == null) {
            return new ArrayList<>();
        }
        return entries.stream()
                .map(entry -> {
                    HotelDTO dto = new HotelDTO();
                    dto.setId(entry.getId());
                    dto.setSectionId(entry.getSectionId());
                    dto.setDescription(entry.getDescription());
                    dto.setAmount(entry.getAmount());
                    dto.setDays(entry.getDays());
                    dto.setTotal(entry.getTotal());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<TelephoneDTO> mapTelephoneToDTO(List<TelephoneEntry> entries) {
        if (entries == null) {
            return new ArrayList<>();
        }
        return entries.stream()
                .map(entry -> {
                    TelephoneDTO dto = new TelephoneDTO();
                    dto.setId(entry.getId());
                    dto.setSectionId(entry.getSectionId());
                    dto.setDescription(entry.getDescription());
                    dto.setAmount(entry.getAmount());
                    dto.setDays(entry.getDays());
                    dto.setTotal(entry.getTotal());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<TaxiDTO> mapTaxiToDTO(List<TaxiEntry> entries) {
        if (entries == null) {
            return new ArrayList<>();
        }
        return entries.stream()
                .map(entry -> {
                    TaxiDTO dto = new TaxiDTO();
                    dto.setId(entry.getId());
                    dto.setSectionId(entry.getSectionId());
                    dto.setDescription(entry.getDescription());
                    dto.setAmount(entry.getAmount());
                    dto.setDays(entry.getDays());
                    dto.setTotal(entry.getTotal());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<MiscellaneousDTO> mapMiscellaneousToDTO(List<MiscellaneousEntry> entries) {
        if (entries == null) {
            return new ArrayList<>();
        }
        return entries.stream()
                .map(entry -> {
                    MiscellaneousDTO dto = new MiscellaneousDTO();
                    dto.setId(entry.getId());
                    dto.setSectionId(entry.getSectionId());
                    dto.setDescription(entry.getDescription());
                    dto.setAmount(entry.getAmount());
                    dto.setDays(entry.getDays());
                    dto.setTotal(entry.getTotal());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<OtherExpenseDTO> mapOtherExpensesToDTO(List<OtherExpenseEntry> entries) {
        if (entries == null) {
            return new ArrayList<>();
        }
        return entries.stream()
                .map(entry -> {
                    OtherExpenseDTO dto = new OtherExpenseDTO();
                    dto.setId(entry.getId());
                    dto.setSectionId(entry.getSectionId());
                    dto.setDescription(entry.getDescription());
                    dto.setAmount(entry.getAmount());
                    dto.setDays(entry.getDays());
                    dto.setTotal(entry.getTotal());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
