export { Anchor } from "./link.js";
export type { LinkComponent, LinkProps } from "./link.js";
export { Brand } from "./brand.js";
export type { BrandProps } from "./brand.js";
export { ArchitectureDiagram, DocumentFlow } from "./architecture.js";
export { ContentIndex } from "./content-index.js";
export type { ContentIndexItem, ContentIndexProps } from "./content-index.js";
export { PublicNav } from "./public-nav.js";
export type { PublicNavProps } from "./public-nav.js";
export { AuthForm } from "./auth-form.js";
export type { AuthFormProps, AuthFormValues } from "./auth-form.js";
export { ContactForm } from "./contact-form.js";
export type { ContactFormProps, ContactFormValues } from "./contact-form.js";
export { color, productAccent, font } from "./tokens.js";
export type { ProductAccent } from "./tokens.js";

/* shadcn/ui primitives — additive; existing exports stay stable. */
export { Button, buttonVariants } from "./components/ui/button.js";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./components/ui/card.js";
export { Separator } from "./components/ui/separator.js";
export { Badge, badgeVariants } from "./components/ui/badge.js";
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "./components/ui/navigation-menu.js";
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./components/ui/sheet.js";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog.js";
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./components/ui/command.js";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./components/ui/table.js";
export { Input } from "./components/ui/input.js";
export { Textarea } from "./components/ui/textarea.js";
export { cn } from "./lib/utils.js";
