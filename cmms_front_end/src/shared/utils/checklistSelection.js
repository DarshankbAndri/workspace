export function addEquipmentSteps(selected, candidates, name = null) {
  const seen = new Set(selected.map(item => item.sourceEquipmentChecklistItemId).filter(Boolean).map(String));
  const added = candidates.filter(item => {
    if (seen.has(String(item.id))) return false;
    seen.add(String(item.id));
    return true;
  }).map(({ id, createdAt, updatedAt, ...item }) => ({ ...item, sourceEquipmentChecklistItemId: id, sourceChecklistName: name }));
  return [...selected, ...added];
}

export function checklistApiError(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  return [data.message || fallback, data.code, ...(data.details || []).map(detail => `${detail.field}: ${detail.message}`), data.correlationId && `Reference: ${data.correlationId}`].filter(Boolean).join(' — ');
}
