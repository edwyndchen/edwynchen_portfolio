/**
 * The contact page form (round 11): inline errors, then it sends in place to Formspree (JSON, so the page never
 * leaves). With no Formspree ID set (src/data/site.ts) it opens the visitor's email app with everything filled in.
 * Without JS the browser's own validation runs and the form posts straight to Formspree (or the mailto).
 */
type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export const MESSAGES: Record<string, (el: Field) => string> = {
  name: () => 'Add your name.',
  email: (el) => (el.validity.valueMissing ? 'Add your email so I can reply.' : 'That email looks incomplete, e.g. name@example.com.'),
  phone: () => 'That number looks incomplete. Digits, spaces, + and brackets only.',
  topic: () => 'Choose what it’s about.',
  message: () => 'Write a short message.',
};

/** The mailto link the fallback opens: subject from the topic, body with the details. Pure, for tests. */
export function mailtoFor(to: string, d: { name: string; email: string; phone?: string; topic: string; message: string }): string {
  const subject = `${d.topic}, from ${d.name}`;
  const body = `${d.message}\n\n${d.name}\n${d.email}${d.phone ? `\n${d.phone}` : ''}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function initContactForm(form: HTMLFormElement): void {
  form.noValidate = true;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const fields = [...form.querySelectorAll<Field>('.field input, .field textarea, .field select')];
  const check = (el: Field) => {
    const err = el.closest('.field')!.querySelector<HTMLElement>('[data-err]')!;
    const empty = el.value.trim() === '';
    const ok = el.required ? !empty && el.checkValidity() : empty || el.checkValidity();
    el.setAttribute('aria-invalid', String(!ok));
    err.textContent = ok ? '' : MESSAGES[el.name]?.(el) ?? 'Check this field.';
    return ok;
  };
  // once a field has been flagged, re-check it as the visitor fixes it
  for (const el of fields) {
    const recheck = () => { if (el.getAttribute('aria-invalid') === 'true') check(el); };
    el.addEventListener('input', recheck);
    el.addEventListener('change', recheck);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bad = fields.filter((el) => !check(el));
    if (bad.length) { bad[0].focus(); return; }
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (data._gotcha) return; // a bot filled the trap
    const mailto = form.dataset.mailto;
    if (mailto) {
      location.href = mailtoFor(mailto, { name: data.name, email: data.email, phone: data.phone, topic: data.topic, message: data.message });
      status.textContent = 'Opening your email app…';
      return;
    }
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      if (!res.ok) throw new Error(String(res.status));
      const done = document.createElement('p');
      done.className = 'cpage__done';
      done.tabIndex = -1;
      done.textContent = 'Thanks, message sent. I’ll get back to you soon.';
      form.replaceChildren(done);
      done.focus();
    } catch {
      button.disabled = false;
      status.textContent = '';
      const a = document.createElement('a');
      a.href = mailtoFor(document.querySelector<HTMLAnchorElement>('a[href^="mailto:"]')?.href.slice(7) ?? '', {
        name: data.name, email: data.email, phone: data.phone, topic: data.topic, message: data.message,
      });
      a.textContent = 'send it by email instead';
      status.append('That didn’t send. Try again, or ', a, '.');
    }
  });
}
