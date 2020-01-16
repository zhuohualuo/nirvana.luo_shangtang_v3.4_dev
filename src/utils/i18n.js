// translate router.meta.title, be used in breadcrumb sidebar tagsview
export function generateTitle(title) {
  const hasKey = this.$te('route.' + title) // $te : whether the key is exist or not

  if (hasKey) {
    return this.$t('route.' + title) // $t : get key value form i18n
  }
  return title
}
