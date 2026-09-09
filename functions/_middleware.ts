export const onRequest = async (context: any) => {
  const response = await context.next();

  // Probate is intentionally excluded from this rollout.
  const pathname = new URL(context.request.url).pathname;
  if (pathname === '/probate-help' || pathname === '/probate-help/') {
    return response;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // Rewrite APB lead forms at the edge so the browser never receives the
  // legacy GoHighLevel webhook URL from the static HTML.
  return new HTMLRewriter()
    .on('form#lead-capture-form', {
      element(element: any) {
        element.setAttribute('action', '/api/lead');
        element.setAttribute('method', 'POST');
      },
    })
    .transform(response);
};
