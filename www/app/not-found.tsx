import { NotFound } from "./not-found-client";

export const metadata = {
  title: "Page Not Found | MLAI Corporation",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return <NotFound />;
}
