export function resolveSlotLink(slot) {
  if (slot.link) {
    return { link: slot.link, source: 'own' };
  }
  if (slot.inherited_link) {
    return { link: slot.inherited_link, source: 'inherited' };
  }
  return { link: null, source: 'none' };
}
