package com.example.travelreimbursement.service;

import com.example.travelreimbursement.dto.DocumentResponse;
import com.example.travelreimbursement.entity.*;
import com.example.travelreimbursement.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentService {

    private final FileStorageService fileStorageService;
    private final DailySummaryDocumentRepository dailySummaryDocumentRepository;
    private final HotelDocumentRepository hotelDocumentRepository;
    private final TelephoneDocumentRepository telephoneDocumentRepository;
    private final TaxiDocumentRepository taxiDocumentRepository;
    private final MiscellaneousDocumentRepository miscellaneousDocumentRepository;
    private final OtherExpenseDocumentRepository otherExpenseDocumentRepository;
    private final DailySummaryEntryRepository dailySummaryEntryRepository;
    private final HotelEntryRepository hotelEntryRepository;
    private final TelephoneEntryRepository telephoneEntryRepository;
    private final TaxiEntryRepository taxiEntryRepository;
    private final MiscellaneousEntryRepository miscellaneousEntryRepository;
    private final OtherExpenseEntryRepository otherExpenseEntryRepository;

    public DocumentService(FileStorageService fileStorageService,
                          DailySummaryDocumentRepository dailySummaryDocumentRepository,
                          HotelDocumentRepository hotelDocumentRepository,
                          TelephoneDocumentRepository telephoneDocumentRepository,
                          TaxiDocumentRepository taxiDocumentRepository,
                          MiscellaneousDocumentRepository miscellaneousDocumentRepository,
                          OtherExpenseDocumentRepository otherExpenseDocumentRepository,
                          DailySummaryEntryRepository dailySummaryEntryRepository,
                          HotelEntryRepository hotelEntryRepository,
                          TelephoneEntryRepository telephoneEntryRepository,
                          TaxiEntryRepository taxiEntryRepository,
                          MiscellaneousEntryRepository miscellaneousEntryRepository,
                          OtherExpenseEntryRepository otherExpenseEntryRepository) {
        this.fileStorageService = fileStorageService;
        this.dailySummaryDocumentRepository = dailySummaryDocumentRepository;
        this.hotelDocumentRepository = hotelDocumentRepository;
        this.telephoneDocumentRepository = telephoneDocumentRepository;
        this.taxiDocumentRepository = taxiDocumentRepository;
        this.miscellaneousDocumentRepository = miscellaneousDocumentRepository;
        this.otherExpenseDocumentRepository = otherExpenseDocumentRepository;
        this.dailySummaryEntryRepository = dailySummaryEntryRepository;
        this.hotelEntryRepository = hotelEntryRepository;
        this.telephoneEntryRepository = telephoneEntryRepository;
        this.taxiEntryRepository = taxiEntryRepository;
        this.miscellaneousEntryRepository = miscellaneousEntryRepository;
        this.otherExpenseEntryRepository = otherExpenseEntryRepository;
    }

    /**
     * Upload a document for a specific entry type
     */
    public DocumentResponse uploadDocument(String entryType, Long entryId, String documentName,
                                          MultipartFile file, String sectionId) throws IOException {
        // Store file on disk
        DailySummaryEntry dailyEntry = null;
        HotelEntry hotelEntry = null;
        TelephoneEntry telephoneEntry = null;
        TaxiEntry taxiEntry = null;
        MiscellaneousEntry miscEntry = null;
        OtherExpenseEntry otherEntry = null;

        Long claimId = null;

        // Fetch the appropriate entry and get claim ID
        switch (entryType.toLowerCase()) {
            case "daily":
                dailyEntry = dailySummaryEntryRepository.findById(entryId)
                    .orElseThrow(() -> new IllegalArgumentException("Daily summary entry not found"));
                claimId = dailyEntry.getClaim().getId();
                break;
            case "hotel":
                hotelEntry = hotelEntryRepository.findById(entryId)
                    .orElseThrow(() -> new IllegalArgumentException("Hotel entry not found"));
                claimId = hotelEntry.getClaim().getId();
                break;
            case "telephone":
                telephoneEntry = telephoneEntryRepository.findById(entryId)
                    .orElseThrow(() -> new IllegalArgumentException("Telephone entry not found"));
                claimId = telephoneEntry.getClaim().getId();
                break;
            case "taxi":
                taxiEntry = taxiEntryRepository.findById(entryId)
                    .orElseThrow(() -> new IllegalArgumentException("Taxi entry not found"));
                claimId = taxiEntry.getClaim().getId();
                break;
            case "miscellaneous":
                miscEntry = miscellaneousEntryRepository.findById(entryId)
                    .orElseThrow(() -> new IllegalArgumentException("Miscellaneous entry not found"));
                claimId = miscEntry.getClaim().getId();
                break;
            case "other":
                otherEntry = otherExpenseEntryRepository.findById(entryId)
                    .orElseThrow(() -> new IllegalArgumentException("Other expense entry not found"));
                claimId = otherEntry.getClaim().getId();
                break;
            default:
                throw new IllegalArgumentException("Invalid entry type: " + entryType);
        }

        // Store file and get path
        String filePath = fileStorageService.storeFile(file, claimId, sectionId);

        // Create document record based on entry type
        switch (entryType.toLowerCase()) {
            case "daily":
                DailySummaryDocument dailyDoc = new DailySummaryDocument();
                dailyDoc.setDocumentName(documentName);
                dailyDoc.setFileName(file.getOriginalFilename());
                dailyDoc.setFilePath(filePath);
                dailyDoc.setSectionId(sectionId);
                dailyDoc.setDailySummaryEntry(dailyEntry);
                dailyDoc.setUploadedAt(LocalDateTime.now());
                dailySummaryDocumentRepository.save(dailyDoc);
                return new DocumentResponse(dailyDoc.getId(), dailyDoc.getDocumentName(),
                    dailyDoc.getFileName(), dailyDoc.getSectionId(), dailyDoc.getUploadedAt());

            case "hotel":
                HotelDocument hotelDoc = new HotelDocument();
                hotelDoc.setDocumentName(documentName);
                hotelDoc.setFileName(file.getOriginalFilename());
                hotelDoc.setFilePath(filePath);
                hotelDoc.setSectionId(sectionId);
                hotelDoc.setHotelEntry(hotelEntry);
                hotelDoc.setUploadedAt(LocalDateTime.now());
                hotelDocumentRepository.save(hotelDoc);
                return new DocumentResponse(hotelDoc.getId(), hotelDoc.getDocumentName(),
                    hotelDoc.getFileName(), hotelDoc.getSectionId(), hotelDoc.getUploadedAt());

            case "telephone":
                TelephoneDocument teleDoc = new TelephoneDocument();
                teleDoc.setDocumentName(documentName);
                teleDoc.setFileName(file.getOriginalFilename());
                teleDoc.setFilePath(filePath);
                teleDoc.setSectionId(sectionId);
                teleDoc.setTelephoneEntry(telephoneEntry);
                teleDoc.setUploadedAt(LocalDateTime.now());
                telephoneDocumentRepository.save(teleDoc);
                return new DocumentResponse(teleDoc.getId(), teleDoc.getDocumentName(),
                    teleDoc.getFileName(), teleDoc.getSectionId(), teleDoc.getUploadedAt());

            case "taxi":
                TaxiDocument taxiDoc = new TaxiDocument();
                taxiDoc.setDocumentName(documentName);
                taxiDoc.setFileName(file.getOriginalFilename());
                taxiDoc.setFilePath(filePath);
                taxiDoc.setSectionId(sectionId);
                taxiDoc.setTaxiEntry(taxiEntry);
                taxiDoc.setUploadedAt(LocalDateTime.now());
                taxiDocumentRepository.save(taxiDoc);
                return new DocumentResponse(taxiDoc.getId(), taxiDoc.getDocumentName(),
                    taxiDoc.getFileName(), taxiDoc.getSectionId(), taxiDoc.getUploadedAt());

            case "miscellaneous":
                MiscellaneousDocument miscDoc = new MiscellaneousDocument();
                miscDoc.setDocumentName(documentName);
                miscDoc.setFileName(file.getOriginalFilename());
                miscDoc.setFilePath(filePath);
                miscDoc.setSectionId(sectionId);
                miscDoc.setMiscellaneousEntry(miscEntry);
                miscDoc.setUploadedAt(LocalDateTime.now());
                miscellaneousDocumentRepository.save(miscDoc);
                return new DocumentResponse(miscDoc.getId(), miscDoc.getDocumentName(),
                    miscDoc.getFileName(), miscDoc.getSectionId(), miscDoc.getUploadedAt());

            case "other":
                OtherExpenseDocument otherDoc = new OtherExpenseDocument();
                otherDoc.setDocumentName(documentName);
                otherDoc.setFileName(file.getOriginalFilename());
                otherDoc.setFilePath(filePath);
                otherDoc.setSectionId(sectionId);
                otherDoc.setOtherExpenseEntry(otherEntry);
                otherDoc.setUploadedAt(LocalDateTime.now());
                otherExpenseDocumentRepository.save(otherDoc);
                return new DocumentResponse(otherDoc.getId(), otherDoc.getDocumentName(),
                    otherDoc.getFileName(), otherDoc.getSectionId(), otherDoc.getUploadedAt());

            default:
                throw new IllegalArgumentException("Invalid entry type: " + entryType);
        }
    }

    /**
     * Get all documents for a section
     */
    public List<DocumentResponse> getDocumentsBySection(String sectionId) {
        List<DocumentResponse> responses = new java.util.ArrayList<>();

        responses.addAll(dailySummaryDocumentRepository.findBySectionId(sectionId)
            .stream()
            .map(d -> new DocumentResponse(d.getId(), d.getDocumentName(), d.getFileName(),
                d.getSectionId(), d.getUploadedAt()))
            .collect(Collectors.toList()));

        responses.addAll(hotelDocumentRepository.findBySectionId(sectionId)
            .stream()
            .map(d -> new DocumentResponse(d.getId(), d.getDocumentName(), d.getFileName(),
                d.getSectionId(), d.getUploadedAt()))
            .collect(Collectors.toList()));

        responses.addAll(telephoneDocumentRepository.findBySectionId(sectionId)
            .stream()
            .map(d -> new DocumentResponse(d.getId(), d.getDocumentName(), d.getFileName(),
                d.getSectionId(), d.getUploadedAt()))
            .collect(Collectors.toList()));

        responses.addAll(taxiDocumentRepository.findBySectionId(sectionId)
            .stream()
            .map(d -> new DocumentResponse(d.getId(), d.getDocumentName(), d.getFileName(),
                d.getSectionId(), d.getUploadedAt()))
            .collect(Collectors.toList()));

        responses.addAll(miscellaneousDocumentRepository.findBySectionId(sectionId)
            .stream()
            .map(d -> new DocumentResponse(d.getId(), d.getDocumentName(), d.getFileName(),
                d.getSectionId(), d.getUploadedAt()))
            .collect(Collectors.toList()));

        responses.addAll(otherExpenseDocumentRepository.findBySectionId(sectionId)
            .stream()
            .map(d -> new DocumentResponse(d.getId(), d.getDocumentName(), d.getFileName(),
                d.getSectionId(), d.getUploadedAt()))
            .collect(Collectors.toList()));

        return responses;
    }

    /**
     * Delete a document
     */
    public void deleteDocument(String entryType, Long documentId) throws IOException {
        switch (entryType.toLowerCase()) {
            case "daily":
                DailySummaryDocument dailyDoc = dailySummaryDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                fileStorageService.deleteFile(dailyDoc.getFilePath());
                dailySummaryDocumentRepository.delete(dailyDoc);
                break;
            case "hotel":
                HotelDocument hotelDoc = hotelDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                fileStorageService.deleteFile(hotelDoc.getFilePath());
                hotelDocumentRepository.delete(hotelDoc);
                break;
            case "telephone":
                TelephoneDocument teleDoc = telephoneDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                fileStorageService.deleteFile(teleDoc.getFilePath());
                telephoneDocumentRepository.delete(teleDoc);
                break;
            case "taxi":
                TaxiDocument taxiDoc = taxiDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                fileStorageService.deleteFile(taxiDoc.getFilePath());
                taxiDocumentRepository.delete(taxiDoc);
                break;
            case "miscellaneous":
                MiscellaneousDocument miscDoc = miscellaneousDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                fileStorageService.deleteFile(miscDoc.getFilePath());
                miscellaneousDocumentRepository.delete(miscDoc);
                break;
            case "other":
                OtherExpenseDocument otherDoc = otherExpenseDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                fileStorageService.deleteFile(otherDoc.getFilePath());
                otherExpenseDocumentRepository.delete(otherDoc);
                break;
            default:
                throw new IllegalArgumentException("Invalid entry type: " + entryType);
        }
    }

    /**
     * Download a document file
     */
    public FileDownloadResponse downloadDocument(Long documentId, String entryType) throws IOException {
        String filePath = null;
        String fileName = null;

        switch (entryType.toLowerCase()) {
            case "daily":
                DailySummaryDocument dailyDoc = dailySummaryDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                filePath = dailyDoc.getFilePath();
                fileName = dailyDoc.getFileName();
                break;
            case "hotel":
                HotelDocument hotelDoc = hotelDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                filePath = hotelDoc.getFilePath();
                fileName = hotelDoc.getFileName();
                break;
            case "telephone":
                TelephoneDocument teleDoc = telephoneDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                filePath = teleDoc.getFilePath();
                fileName = teleDoc.getFileName();
                break;
            case "taxi":
                TaxiDocument taxiDoc = taxiDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                filePath = taxiDoc.getFilePath();
                fileName = taxiDoc.getFileName();
                break;
            case "miscellaneous":
                MiscellaneousDocument miscDoc = miscellaneousDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                filePath = miscDoc.getFilePath();
                fileName = miscDoc.getFileName();
                break;
            case "other":
                OtherExpenseDocument otherDoc = otherExpenseDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new IllegalArgumentException("Document not found"));
                filePath = otherDoc.getFilePath();
                fileName = otherDoc.getFileName();
                break;
            default:
                throw new IllegalArgumentException("Invalid entry type: " + entryType);
        }

        byte[] fileContent = fileStorageService.retrieveFile(filePath);
        return new FileDownloadResponse(fileName, fileContent);
    }

    /**
     * Inner class for file download response
     */
    public static class FileDownloadResponse {
        private final String fileName;
        private final byte[] content;

        public FileDownloadResponse(String fileName, byte[] content) {
            this.fileName = fileName;
            this.content = content;
        }

        public String getFileName() {
            return fileName;
        }

        public byte[] getContent() {
            return content;
        }
    }
}
