// Centralized status label and badge variant mappings
export const supportRequestStatusMap = {
  pending:        { text: 'Onay Bekliyor', variant: 'warning' },
  admin_approved: { text: 'Admin Onaylı', variant: 'info' },
  admin_rejected: { text: 'Admin Reddedildi', variant: 'danger' },
  open:           { text: 'Açık', variant: 'success' },
  assigned:       { text: 'Atandı', variant: 'primary' },
  in_progress:    { text: 'Devam Ediyor', variant: 'info' },
  completed:      { text: 'Tamamlandı', variant: 'success' },
  cancelled:      { text: 'İptal Edildi', variant: 'secondary' },
  // Backward/alternate labels occasionally used in admin screens:
  active:         { text: 'Aktif', variant: 'info' },
};

export const offerStatusMap = {
  pending:        { text: 'Admin Onayı Bekliyor', variant: 'warning' },
  admin_approved: { text: 'Admin Onaylandı', variant: 'info' },
  admin_rejected: { text: 'Admin Reddedildi', variant: 'danger' },
  accepted:       { text: 'Kabul Edildi', variant: 'success' },
  rejected:       { text: 'Reddedildi', variant: 'danger' },
  cancelled:      { text: 'İptal Edildi', variant: 'secondary' },
};

export const paymentStatusMap = {
  pending:  { text: 'Onay Bekliyor', variant: 'warning' },
  approved: { text: 'Onaylandı', variant: 'success' },
  rejected: { text: 'Reddedildi', variant: 'danger' },
};

export function getStatusDisplay(map, status) {
  if (!status) return { text: 'Bilinmiyor', variant: 'secondary' };
  return map[status] || { text: status, variant: 'secondary' };
}


