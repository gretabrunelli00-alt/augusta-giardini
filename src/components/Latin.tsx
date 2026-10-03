/** Nome latino in corsivo; l'abbreviazione " sp." resta in tondo. */
export function Latin({ name }: { name: string }) {
  const m = /^(.*?)( sp\.)?$/.exec(name);
  return (
    <>
      <i>{m?.[1] ?? name}</i>
      {m?.[2]}
    </>
  );
}
