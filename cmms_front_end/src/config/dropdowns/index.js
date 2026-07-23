const COMMON = {
  "pageName": "COMMON",
  "serviceType": "UI",
  "dropDownMasterList": {
    "activeStatus": [
      {
        "value": "ACTIVE",
        "label": "ACTIVE"
      },
      {
        "value": "INACTIVE",
        "label": "INACTIVE"
      }
    ],
    "booleanActiveStatus": [
      {
        "value": "true",
        "label": "Active"
      },
      {
        "value": "false",
        "label": "Inactive"
      }
    ],
    "yesNo": [
      {
        "value": true,
        "label": "Yes"
      },
      {
        "value": false,
        "label": "No"
      }
    ],
    "priority": [
      {
        "value": "LOW",
        "label": "Low"
      },
      {
        "value": "MEDIUM",
        "label": "Medium"
      },
      {
        "value": "HIGH",
        "label": "High"
      },
      {
        "value": "URGENT",
        "label": "Urgent"
      }
    ],
    "criticalityPriority": [
      {
        "value": "LOW",
        "label": "LOW"
      },
      {
        "value": "MEDIUM",
        "label": "MEDIUM"
      },
      {
        "value": "HIGH",
        "label": "HIGH"
      },
      {
        "value": "CRITICAL",
        "label": "CRITICAL"
      }
    ],
    "checklistResponseType": [
      {
        "value": "CHECKBOX",
        "label": "CHECKBOX"
      },
      {
        "value": "TEXT",
        "label": "TEXT"
      },
      {
        "value": "NUMBER",
        "label": "NUMBER"
      },
      {
        "value": "PHOTO",
        "label": "PHOTO"
      }
    ]
  }
};

const COMPANY_MASTER = {
  "pageName": "COMPANY_MASTER",
  "serviceType": "UI",
  "dropDownMasterList": {}
};

const SITE_MASTER = {
  "pageName": "SITE_MASTER",
  "serviceType": "UI",
  "dropDownMasterList": {}
};

const EMPLOYEE_MASTER = {
  "pageName": "EMPLOYEE_MASTER",
  "serviceType": "UI",
  "dropDownMasterList": {
    "gender": [
      {
        "value": "",
        "label": "Not set"
      },
      {
        "value": "MALE",
        "label": "MALE"
      },
      {
        "value": "FEMALE",
        "label": "FEMALE"
      },
      {
        "value": "OTHER",
        "label": "OTHER"
      }
    ],
    "authRole": [
      {
        "value": "EMPLOYEE",
        "label": "EMPLOYEE"
      },
      {
        "value": "MANAGER",
        "label": "MANAGER"
      },
      {
        "value": "HR",
        "label": "HR"
      },
      {
        "value": "ADMIN",
        "label": "ADMIN"
      }
    ],
    "globalSiteOption": [
      {
        "value": "",
        "label": "Global"
      }
    ]
  }
};

const ROLE_MASTER = {
  "pageName": "ROLE_MASTER",
  "serviceType": "UI",
  "dropDownMasterList": {}
};

const VENDOR_MASTER = {
  "pageName": "VENDOR_MASTER",
  "serviceType": "UI",
  "dropDownMasterList": {}
};

const VENDOR_AMC = {
  "pageName": "VENDOR_AMC",
  "serviceType": "UI",
  "dropDownMasterList": {
    "contractStatus": [
      {
        "value": "DRAFT",
        "label": "DRAFT"
      },
      {
        "value": "ACTIVE",
        "label": "ACTIVE"
      },
      {
        "value": "EXPIRING_SOON",
        "label": "EXPIRING SOON"
      },
      {
        "value": "EXPIRED",
        "label": "EXPIRED"
      },
      {
        "value": "TERMINATED",
        "label": "TERMINATED"
      },
      {
        "value": "RENEWED",
        "label": "RENEWED"
      }
    ],
    "contractType": [
      {
        "value": "COMPREHENSIVE",
        "label": "COMPREHENSIVE"
      },
      {
        "value": "LABOR_ONLY",
        "label": "LABOR ONLY"
      },
      {
        "value": "SPARES_ONLY",
        "label": "SPARES ONLY"
      },
      {
        "value": "INSPECTION",
        "label": "INSPECTION"
      },
      {
        "value": "OTHER",
        "label": "OTHER"
      }
    ]
  }
};

const EQUIPMENT_MASTER = {
  "pageName": "EQUIPMENT_MASTER",
  "serviceType": "UI",
  "dropDownMasterList": {
    "equipmentStatus": [
      {
        "value": "ACTIVE",
        "label": "Active"
      },
      {
        "value": "INACTIVE",
        "label": "Inactive"
      },
      {
        "value": "UNDER_MAINTENANCE",
        "label": "Under Maintenance"
      },
      {
        "value": "RETIRED",
        "label": "Retired"
      }
    ],
    "bomStatus": [
      {
        "value": "ACTIVE",
        "label": "Active"
      },
      {
        "value": "INACTIVE",
        "label": "Inactive"
      }
    ],
    "criticality": [
      {
        "value": "LOW",
        "label": "Low"
      },
      {
        "value": "MEDIUM",
        "label": "Medium"
      },
      {
        "value": "HIGH",
        "label": "High"
      },
      {
        "value": "CRITICAL",
        "label": "Critical"
      }
    ],
    "lifecycleStatus": [
      {
        "value": "DRAFT",
        "label": "Draft"
      },
      {
        "value": "COMMISSIONED",
        "label": "Commissioned"
      },
      {
        "value": "ACTIVE",
        "label": "Active"
      },
      {
        "value": "STANDBY",
        "label": "Standby"
      },
      {
        "value": "UNDER_MAINTENANCE",
        "label": "Under Maintenance"
      },
      {
        "value": "BREAKDOWN",
        "label": "Breakdown"
      },
      {
        "value": "DECOMMISSIONED",
        "label": "Decommissioned"
      },
      {
        "value": "SCRAPPED",
        "label": "Scrapped"
      }
    ],
    "assetCondition": [
      {
        "value": "GOOD",
        "label": "Good"
      },
      {
        "value": "FAIR",
        "label": "Fair"
      },
      {
        "value": "POOR",
        "label": "Poor"
      },
      {
        "value": "CRITICAL",
        "label": "Critical"
      },
      {
        "value": "UNKNOWN",
        "label": "Unknown"
      }
    ],
    "operatingStatus": [
      {
        "value": "RUNNING",
        "label": "Running"
      },
      {
        "value": "STANDBY",
        "label": "Standby"
      },
      {
        "value": "STOPPED",
        "label": "Stopped"
      },
      {
        "value": "UNDER_MAINTENANCE",
        "label": "Under Maintenance"
      },
      {
        "value": "BREAKDOWN",
        "label": "Breakdown"
      }
    ],
    "ownershipType": [
      {
        "value": "OWNED",
        "label": "Owned"
      },
      {
        "value": "LEASED",
        "label": "Leased"
      },
      {
        "value": "RENTED",
        "label": "Rented"
      },
      {
        "value": "CUSTOMER_SUPPLIED",
        "label": "Customer Supplied"
      }
    ],
    "depreciationMethod": [
      {
        "value": "STRAIGHT_LINE",
        "label": "Straight Line"
      },
      {
        "value": "DECLINING_BALANCE",
        "label": "Declining Balance"
      },
      {
        "value": "UNITS_OF_PRODUCTION",
        "label": "Units of Production"
      },
      {
        "value": "NOT_APPLICABLE",
        "label": "Not Applicable"
      }
    ],
    "documentType": [
      {
        "value": "MANUAL",
        "label": "Manual"
      },
      {
        "value": "DRAWING",
        "label": "Drawing"
      },
      {
        "value": "CERTIFICATE",
        "label": "Certificate"
      },
      {
        "value": "INSPECTION_REPORT",
        "label": "Inspection Report"
      },
      {
        "value": "SOP",
        "label": "SOP"
      },
      {
        "value": "WARRANTY",
        "label": "Warranty"
      },
      {
        "value": "SAFETY",
        "label": "Safety"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  }
};

const MAINTENANCE_REQUEST = {
  "pageName": "MAINTENANCE_REQUEST",
  "serviceType": "UI",
  "dropDownMasterList": {
    "requestType": [
      {
        "value": "BREAKDOWN",
        "label": "Breakdown"
      },
      {
        "value": "PREVENTIVE",
        "label": "Preventive"
      },
      {
        "value": "INSPECTION",
        "label": "Inspection"
      },
      {
        "value": "CALIBRATION",
        "label": "Calibration"
      }
    ],
    "priority": [
      {
        "value": "LOW",
        "label": "Low"
      },
      {
        "value": "MEDIUM",
        "label": "Medium"
      },
      {
        "value": "HIGH",
        "label": "High"
      },
      {
        "value": "URGENT",
        "label": "Urgent"
      }
    ],
    "requestStatus": [
      {
        "value": "OPEN",
        "label": "Open"
      },
      {
        "value": "ASSIGNED",
        "label": "Assigned"
      },
      {
        "value": "IN_PROGRESS",
        "label": "In Progress"
      },
      {
        "value": "ON_HOLD",
        "label": "On Hold"
      },
      {
        "value": "COMPLETED",
        "label": "Completed"
      },
      {
        "value": "CLOSED",
        "label": "Closed"
      },
      {
        "value": "CANCELLED",
        "label": "Cancelled"
      },
      {
        "value": "PENDING_APPROVAL",
        "label": "Pending Approval"
      },
      {
        "value": "CLOSE_PENDING_APPROVAL",
        "label": "Close Pending Approval"
      },
      {
        "value": "REJECTED",
        "label": "Rejected"
      }
    ]
  }
};

const MAINTENANCE_ASSIGNMENT = {
  "pageName": "MAINTENANCE_ASSIGNMENT",
  "serviceType": "UI",
  "dropDownMasterList": {
    "assignmentStatus": [
      {
        "value": "ASSIGNED",
        "label": "Assigned"
      },
      {
        "value": "IN_PROGRESS",
        "label": "In Progress"
      },
      {
        "value": "COMPLETED",
        "label": "Completed"
      },
      {
        "value": "CANCELLED",
        "label": "Cancelled"
      }
    ],
    "checklistStatus": [
      {
        "value": "PENDING",
        "label": "PENDING"
      },
      {
        "value": "COMPLETED",
        "label": "COMPLETED"
      },
      {
        "value": "NOT_APPLICABLE",
        "label": "NOT APPLICABLE"
      }
    ],
    "workLogStatus": [
      {
        "value": "IN_PROGRESS",
        "label": "IN PROGRESS"
      },
      {
        "value": "COMPLETED",
        "label": "COMPLETED"
      },
      {
        "value": "FOLLOW_UP_REQUIRED",
        "label": "FOLLOW UP REQUIRED"
      },
      {
        "value": "CANCELLED",
        "label": "CANCELLED"
      }
    ],
    "manualTechnicianOption": [
      {
        "value": "",
        "label": "Manual / external technician"
      }
    ]
  }
};

const EQUIPMENT_DOWNTIME = {
  "pageName": "EQUIPMENT_DOWNTIME",
  "serviceType": "UI",
  "dropDownMasterList": {
    "downtimeStatus": [
      {
        "value": "OPEN",
        "label": "OPEN"
      },
      {
        "value": "CONFIRMED",
        "label": "CONFIRMED"
      },
      {
        "value": "UNDER_MAINTENANCE",
        "label": "UNDER MAINTENANCE"
      },
      {
        "value": "RESTORED",
        "label": "RESTORED"
      },
      {
        "value": "VERIFIED",
        "label": "VERIFIED"
      },
      {
        "value": "CLOSED",
        "label": "CLOSED"
      },
      {
        "value": "REOPENED",
        "label": "REOPENED"
      },
      {
        "value": "CANCELLED",
        "label": "CANCELLED"
      }
    ],
    "reasonCategory": [
      {
        "value": "MECHANICAL",
        "label": "MECHANICAL"
      },
      {
        "value": "ELECTRICAL",
        "label": "ELECTRICAL"
      },
      {
        "value": "INSTRUMENTATION",
        "label": "INSTRUMENTATION"
      },
      {
        "value": "UTILITY_FAILURE",
        "label": "UTILITY FAILURE"
      },
      {
        "value": "MATERIAL_SHORTAGE",
        "label": "MATERIAL SHORTAGE"
      },
      {
        "value": "OPERATOR_ERROR",
        "label": "OPERATOR ERROR"
      },
      {
        "value": "PLANNED_SHUTDOWN",
        "label": "PLANNED SHUTDOWN"
      },
      {
        "value": "CHANGEOVER",
        "label": "CHANGEOVER"
      },
      {
        "value": "SAFETY_STOP",
        "label": "SAFETY STOP"
      },
      {
        "value": "OTHER",
        "label": "OTHER"
      }
    ],
    "plannedType": [
      {
        "value": false,
        "label": "Unplanned"
      },
      {
        "value": true,
        "label": "Planned"
      }
    ],
    "rcaActionType": [
      {
        "value": "CORRECTIVE",
        "label": "CORRECTIVE"
      },
      {
        "value": "PREVENTIVE",
        "label": "PREVENTIVE"
      }
    ],
    "rcaStatus": [
      {
        "value": "OPEN",
        "label": "OPEN"
      },
      {
        "value": "IN_PROGRESS",
        "label": "IN PROGRESS"
      },
      {
        "value": "COMPLETED",
        "label": "COMPLETED"
      },
      {
        "value": "VERIFIED",
        "label": "VERIFIED"
      },
      {
        "value": "CANCELLED",
        "label": "CANCELLED"
      }
    ],
    "noRequestOption": [
      {
        "value": "",
        "label": "No request"
      }
    ]
  }
};

const PREVENTIVE_MAINTENANCE = {
  "pageName": "PREVENTIVE_MAINTENANCE",
  "serviceType": "UI",
  "dropDownMasterList": {
    "frequency": [
      {
        "value": "DAILY",
        "label": "DAILY"
      },
      {
        "value": "WEEKLY",
        "label": "WEEKLY"
      },
      {
        "value": "MONTHLY",
        "label": "MONTHLY"
      },
      {
        "value": "QUARTERLY",
        "label": "QUARTERLY"
      },
      {
        "value": "YEARLY",
        "label": "YEARLY"
      }
    ],
    "active": [
      {
        "value": "true",
        "label": "Active"
      },
      {
        "value": "false",
        "label": "Inactive"
      }
    ],
    "approvalStatus": [
      {
        "value": "ACTIVE",
        "label": "Active"
      },
      {
        "value": "COMPLETED",
        "label": "Completed"
      },
      {
        "value": "APPROVED",
        "label": "Approved"
      },
      {
        "value": "PENDING_APPROVAL",
        "label": "Pending Approval"
      },
      {
        "value": "REJECTED",
        "label": "Rejected"
      }
    ],
    "internalTeamOption": [
      {
        "value": "",
        "label": "Internal team"
      }
    ],
    "amcNotLinkedOption": [
      {
        "value": "",
        "label": "Do not link AMC"
      }
    ],
    "amcLoadingOption": [
      {
        "value": "",
        "label": "Checking AMC..."
      }
    ]
  }
};

const SPARE_PART = {
  "pageName": "SPARE_PART",
  "serviceType": "UI",
  "dropDownMasterList": {
    "stockStatus": [
      {
        "value": "",
        "label": "All"
      },
      {
        "value": "true",
        "label": "Low Stock"
      },
      {
        "value": "false",
        "label": "OK"
      }
    ],
    "spareStatus": [
      {
        "value": "ACTIVE",
        "label": "Active"
      },
      {
        "value": "INACTIVE",
        "label": "Inactive"
      }
    ],
    "noPreferredVendorOption": [
      {
        "value": "",
        "label": "No preferred vendor"
      }
    ]
  }
};

const SPARE_REQUEST = {
  "pageName": "SPARE_REQUEST",
  "serviceType": "UI",
  "dropDownMasterList": {
    "storeStatus": [
      {
        "value": "",
        "label": "Open Store Requests"
      },
      {
        "value": "MANAGER_APPROVED",
        "label": "MANAGER APPROVED"
      },
      {
        "value": "STOCK_AVAILABLE",
        "label": "STOCK AVAILABLE"
      },
      {
        "value": "STOCK_NOT_AVAILABLE",
        "label": "STOCK NOT AVAILABLE"
      },
      {
        "value": "PURCHASE_REQUESTED",
        "label": "PURCHASE REQUESTED"
      },
      {
        "value": "PURCHASE_RECEIVED",
        "label": "PURCHASE RECEIVED"
      },
      {
        "value": "RESERVED",
        "label": "RESERVED"
      },
      {
        "value": "ISSUED",
        "label": "ISSUED"
      },
      {
        "value": "PARTIALLY_CONSUMED",
        "label": "PARTIALLY CONSUMED"
      }
    ]
  }
};

const PURCHASE_REQUEST = {
  "pageName": "PURCHASE_REQUEST",
  "serviceType": "UI",
  "dropDownMasterList": {
    "reorderStatusFilter": [
      {
        "value": "",
        "label": "All Statuses"
      },
      {
        "value": "REQUESTED",
        "label": "REQUESTED"
      },
      {
        "value": "ORDERED",
        "label": "ORDERED"
      },
      {
        "value": "RECEIVED",
        "label": "RECEIVED"
      },
      {
        "value": "CANCELLED",
        "label": "CANCELLED"
      }
    ],
    "reorderStatus": [
      {
        "value": "REQUESTED",
        "label": "REQUESTED"
      },
      {
        "value": "ORDERED",
        "label": "ORDERED"
      },
      {
        "value": "RECEIVED",
        "label": "RECEIVED"
      },
      {
        "value": "CANCELLED",
        "label": "CANCELLED"
      }
    ]
  }
};

const APPROVAL = {
  "pageName": "APPROVAL",
  "serviceType": "UI",
  "dropDownMasterList": {
    "approvalStatus": [
      {
        "value": "PENDING",
        "label": "Pending"
      },
      {
        "value": "APPROVED",
        "label": "Approved"
      },
      {
        "value": "REJECTED",
        "label": "Rejected"
      }
    ],
    "approvalModule": [
      {
        "value": "MAINTENANCE_REQUEST",
        "label": "Maintenance Request"
      },
      {
        "value": "PM_SCHEDULE",
        "label": "PM Schedule"
      },
      {
        "value": "PM_WORK_ORDER",
        "label": "PM Work Order"
      },
      {
        "value": "SPARE_ISSUE",
        "label": "Spare Issue"
      }
    ],
    "approvalAction": [
      {
        "value": "CREATE",
        "label": "Create"
      },
      {
        "value": "UPDATE",
        "label": "Update"
      },
      {
        "value": "GENERATE",
        "label": "Generate"
      },
      {
        "value": "CLOSE",
        "label": "Close"
      },
      {
        "value": "RESERVE",
        "label": "Reserve"
      },
      {
        "value": "ISSUE",
        "label": "Issue"
      }
    ],
    "configStatus": [
      {
        "value": "ACTIVE",
        "label": "ACTIVE"
      },
      {
        "value": "INACTIVE",
        "label": "INACTIVE"
      }
    ],
    "anyApprovalUserOption": [
      {
        "value": "",
        "label": "Any approval user"
      }
    ]
  }
};

const NOTIFICATION = {
  "pageName": "NOTIFICATION",
  "serviceType": "UI",
  "dropDownMasterList": {}
};

const USER_MANAGEMENT = {
  "pageName": "USER_MANAGEMENT",
  "serviceType": "UI",
  "dropDownMasterList": {
    "role": [
      {
        "value": "EMPLOYEE",
        "label": "Employee"
      },
      {
        "value": "MANAGER",
        "label": "Manager"
      },
      {
        "value": "HR",
        "label": "HR"
      }
    ]
  }
};

export const dropdownConfigurations = {
  COMMON,
  COMPANY_MASTER,
  SITE_MASTER,
  EMPLOYEE_MASTER,
  ROLE_MASTER,
  VENDOR_MASTER,
  VENDOR_AMC,
  EQUIPMENT_MASTER,
  MAINTENANCE_REQUEST,
  MAINTENANCE_ASSIGNMENT,
  EQUIPMENT_DOWNTIME,
  PREVENTIVE_MAINTENANCE,
  SPARE_PART,
  SPARE_REQUEST,
  PURCHASE_REQUEST,
  APPROVAL,
  NOTIFICATION,
  USER_MANAGEMENT,
};
