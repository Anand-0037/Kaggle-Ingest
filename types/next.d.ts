// Type declarations for Next.js modules
declare module 'next' {
    export interface NextConfig {
        allowedDevOrigins?: string[];
        images?: {
            remotePatterns?: Array<{
                protocol?: string;
                hostname?: string;
                port?: string;
                pathname?: string;
            }>;
        };
        [key: string]: any;
    }

    export interface Metadata {
        title?: string;
        description?: string;
        [key: string]: any;
    }
}

declare module 'next/font/google' {
    export interface FontConfig {
        subsets?: string[];
        display?: string;
        variable?: string;
    }

    export function Inter(config?: FontConfig): {
        variable: string;
        className: string;
    };
}

declare module 'next/navigation' {
    export function notFound(): never;
    export function useRouter(): {
        push: (href: string) => void;
        replace: (href: string) => void;
        back: () => void;
        forward: () => void;
        refresh: () => void;
        prefetch: (href: string) => void;
    };
}

declare module 'next/link' {
    import { ComponentProps } from 'react';

    interface LinkProps extends ComponentProps<'a'> {
        href: string;
        as?: string;
        replace?: boolean;
        scroll?: boolean;
        shallow?: boolean;
        passHref?: boolean;
        prefetch?: boolean;
    }

    const Link: React.FC<LinkProps>;
    export default Link;
}

declare module 'next/cache' {
    export function revalidatePath(path: string): void;
    export function revalidateTag(tag: string): void;
}

declare module 'next/headers' {
    export interface RequestCookies {
        get(name: string): { value: string } | undefined;
        set(name: string, value: string, options?: any): void;
        delete(name: string): void;
    }

    export function cookies(): RequestCookies;
}