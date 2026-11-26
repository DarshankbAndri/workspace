package com.example.cmmsApplication.common.search.service;

import com.example.cmmsApplication.common.search.dto.PageProperties;
import com.example.cmmsApplication.common.search.dto.SearchDTO;

/** Service contract for list search. */
public interface ListSearchService {
    PageProperties searchSites(SearchDTO searchDTO);

    PageProperties searchEmployees(SearchDTO searchDTO);

    PageProperties searchVendors(SearchDTO searchDTO);

    PageProperties searchMaintenanceRequests(SearchDTO searchDTO);

    PageProperties searchMaintenanceAssignments(SearchDTO searchDTO);

    PageProperties searchMyMaintenanceAssignments(SearchDTO searchDTO);

    PageProperties searchPendingApprovals(SearchDTO searchDTO);

    PageProperties searchDowntime(SearchDTO searchDTO);

    PageProperties searchPreventiveSchedules(SearchDTO searchDTO);

    PageProperties searchRoles(SearchDTO searchDTO);

    PageProperties searchSparePartStocks(SearchDTO searchDTO);
}
