import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
    items: { label: string; path?: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className={cn("text-sm text-gray-500 mb-4 bg-gray-100 p-2 rounded-md")}>
            <ol className="flex items-center gap-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {item.path ? (
                            <Link to={item.path} className="hover:underline text-gray-700">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-primary font-medium">{item.label}</span>
                        )}
                        {index < items.length - 1 && (
                            <span className="mx-2 text-gray-500">
                                <ChevronRight size={16} />
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

Breadcrumb.displayName = "Breadcrumb";