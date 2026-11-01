export function jobPostingJsonLd(job: {
  title: string
  description: string
  datePosted: string
  validThrough?: string
  employmentType?: string
  hiringOrganization?: { name: string; sameAs?: string }
  jobLocation?: { address: { addressLocality: string; addressRegion?: string; streetAddress?: string; postalCode?: string } }
  baseSalary?: { value: { currency: string; value: number } }
}) {
  const ld: any = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
  }
  if (job.validThrough) ld.validThrough = job.validThrough
  if (job.employmentType) ld.employmentType = job.employmentType
  if (job.hiringOrganization) ld.hiringOrganization = job.hiringOrganization
  if (job.jobLocation) ld.jobLocation = job.jobLocation
  if (job.baseSalary) ld.baseSalary = { '@type': 'MonetaryAmount', value: job.baseSalary.value }
  return JSON.stringify(ld)
}

export function localBusinessJsonLd(biz: {
  name: string
  description?: string
  url: string
  telephone?: string
  address?: { streetAddress?: string; addressLocality?: string; addressRegion?: string; postalCode?: string }
  geo?: { latitude: number; longitude: number }
}) {
  const ld: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    url: biz.url,
  }
  if (biz.description) ld.description = biz.description
  if (biz.telephone) ld.telephone = biz.telephone
  if (biz.address) ld.address = { '@type': 'PostalAddress', ...biz.address }
  if (biz.geo) ld.geo = { '@type': 'GeoCoordinates', ...biz.geo }
  return JSON.stringify(ld)
}
