/* Логотип бренда — растровое изображение из public/logo.webp.
   Чтобы заменить картинку, положите свой файл в public/logo.webp (тот же путь). */
export default function Logo({ size = 34, radius = 0 }) {
  return (
    <img src="/logo.webp" width={size} height={size} alt="Время сдавать"
      style={{ display: "block", borderRadius: radius, objectFit: "contain", objectFit: "cover", height: "100%" }} />
  );
}
