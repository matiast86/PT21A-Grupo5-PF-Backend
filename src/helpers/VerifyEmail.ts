const baseUrl = process.env.BASE_URL_BACK || 'http://localhost:3000/';

export const verificationEmail = async (
  email: string,
  code: string,
  url: string,
) => {
  const verified = await fetch(
    `${baseUrl}auth/codeVerification/?email=${email}&code=${code}`,
    { method: 'POST' },
  )
    .then((res) => res.json())
    .catch((e) => e.message);
  
  if (verified.message === 'Cuenta verificada exitosamente.') {
    return `http://localhost:3000/code-verification`; //Cambiar a `${url}code-verification` cuando este listo.
  }
};
