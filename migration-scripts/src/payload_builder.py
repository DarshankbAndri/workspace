"""Build backend request payloads from CSV rows.

Each entity has a dedicated builder that maps CSV columns onto the backend DTO
(field names verified against the cmms_back_end DTOs) and resolves code-based
references (siteCode -> siteId, vendorCode -> vendorId) using the id registry
populated by the migration runner.
"""


class ReferenceResolutionError(Exception):
    """Raised when a required parent reference (siteCode/vendorCode) cannot be resolved."""


def _pick(row: dict, fields) -> dict:
    """Copy only the non-empty fields from row into a new dict (keeps payloads clean)."""
    out = {}
    for f in fields:
        val = row.get(f)
        if val is not None and val != "":
            out[f] = val
    return out


def _status_to_active(status):
    """Map a status string onto the boolean 'active' flag used by VendorDTO."""
    if status is None:
        return None
    return status.strip().upper() == "ACTIVE"


# ---------------------------------------------------------------------------
# Per-entity builders -> return a dict ready to be POSTed as JSON.
# ---------------------------------------------------------------------------

_SITE_FIELDS = [
    "siteCode", "siteName", "organizationName", "siteType",
    "addressLine1", "addressLine2", "city", "state", "country", "pincode",
    "contactPerson", "contactMobile", "contactEmail",
    "latitude", "longitude", "status",
]

_VENDOR_FIELDS = [
    "vendorCode", "vendorName", "contactPerson", "email", "phone",
    "address", "serviceCategory",
]

_EMPLOYEE_FIELDS = [
    "employeeCode", "firstName", "lastName", "mobileNumber", "email",
    "gender", "dateOfBirth", "dateOfJoining", "designation", "department", "status",
]

_EQUIPMENT_FIELDS = [
    "equipmentCode", "equipmentName", "equipmentType", "category", "location",
    "manufacturer", "modelNumber", "serialNumber",
    "installationDate", "warrantyExpiryDate", "status", "criticality",
]


def build_site(row, registry):
    return _pick(row, _SITE_FIELDS)


def build_vendor(row, registry):
    payload = _pick(row, _VENDOR_FIELDS)
    active = _status_to_active(row.get("status"))
    if active is not None:
        payload["active"] = active

    # The backend requires at least one site assignment per vendor.
    site_code = row.get("siteCode")
    if site_code:
        site_id = registry.get("site", {}).get(site_code)
        if site_id is None:
            raise ReferenceResolutionError(
                f"vendor '{row.get('vendorCode')}' references unknown siteCode '{site_code}'"
            )
        payload["siteAssignments"] = [{
            "siteId": site_id,
            "primarySite": True,
            "status": "ACTIVE",
        }]
    return payload


def build_employee(row, registry):
    payload = _pick(row, _EMPLOYEE_FIELDS)

    # Optional site assignment: only when both siteCode and roleName are present.
    site_code = row.get("siteCode")
    role_name = row.get("roleName")
    if site_code and role_name:
        site_id = registry.get("site", {}).get(site_code)
        if site_id is None:
            raise ReferenceResolutionError(
                f"employee '{row.get('employeeCode')}' references unknown siteCode '{site_code}'"
            )
        payload["siteAssignments"] = [{
            "siteId": site_id,
            "roleName": role_name,
            "primarySite": True,
            "status": "ACTIVE",
        }]
    return payload


def build_equipment(row, registry):
    payload = _pick(row, _EQUIPMENT_FIELDS)

    # siteId is mandatory on EquipmentDTO -> resolve from siteCode.
    site_code = row.get("siteCode")
    if not site_code:
        raise ReferenceResolutionError(
            f"equipment '{row.get('equipmentCode')}' is missing required siteCode"
        )
    site_id = registry.get("site", {}).get(site_code)
    if site_id is None:
        raise ReferenceResolutionError(
            f"equipment '{row.get('equipmentCode')}' references unknown siteCode '{site_code}'"
        )
    payload["siteId"] = site_id

    # vendorId is optional.
    vendor_code = row.get("vendorCode")
    if vendor_code:
        vendor_id = registry.get("vendor", {}).get(vendor_code)
        if vendor_id is None:
            raise ReferenceResolutionError(
                f"equipment '{row.get('equipmentCode')}' references unknown vendorCode '{vendor_code}'"
            )
        payload["vendorId"] = vendor_id

    return payload


# Entity name (as used in config 'files') -> builder function.
BUILDERS = {
    "sites": build_site,
    "vendors": build_vendor,
    "employees": build_employee,
    "equipment": build_equipment,
}


def build_payload(entity_name: str, row: dict, registry: dict) -> dict:
    builder = BUILDERS.get(entity_name)
    if builder is None:
        # Generic fallback: send all non-empty columns as-is.
        return _pick(row, list(row.keys()))
    return builder(row, registry)
