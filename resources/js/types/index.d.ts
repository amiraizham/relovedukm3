export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null; // ✅ Add this
    bio?: string | null;  
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};


export type BreadcrumbItem = {
    title: string;
    href?: string;       // URL for breadcrumb (optional)
    current?: boolean;   // Whether this breadcrumb is the current page (optional)
  };
  

  
  // SharedData represents globally shared Inertia props
  export type SharedData = {
    auth: {
      user: User | null;
    };
    flash?: {
      success?: string;
      error?: string;
    };
    sidebarOpen: boolean;

    // Add any other globally shared data you pass from Laravel here
  };
  
  export type NavItem = {
    title: string;               // Text label for the nav item
    href: string;                // URL or path
    icon?: React.ComponentType<{ className?: string }>;  // Optional icon component (e.g. lucide-react icons)
    current?: boolean;           // Optional flag if this nav item is the current active page
  };