export const formatCurrencyCOP = value =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

export const getTrustVariant = score => {
  if (score >= 90) return 'high';
  if (score >= 80) return 'medium';
  return 'low';
};

export const buildCatalogMetrics = properties => {
  if (!properties.length) {
    return {
      avgPrice: 0,
      avgArea: 0,
      avgTrust: 0,
      verifiedRatio: 0
    };
  }

  const summary = properties.reduce(
    (acc, property) => {
      acc.totalPrice += property.price;
      acc.totalArea += property.area;
      acc.totalTrust += property.trust.score;
      if (property.trust.verifiedOwner && property.trust.legalDocs) {
        acc.verified += 1;
      }
      return acc;
    },
    { totalPrice: 0, totalArea: 0, totalTrust: 0, verified: 0 }
  );

  return {
    avgPrice: Math.round(summary.totalPrice / properties.length),
    avgArea: Math.round(summary.totalArea / properties.length),
    avgTrust: Math.round(summary.totalTrust / properties.length),
    verifiedRatio: Math.round((summary.verified / properties.length) * 100)
  };
};
