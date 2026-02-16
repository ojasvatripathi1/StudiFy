import type { SVGProps } from 'react';
import Image from 'next/image';

interface StudiFyLogoProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
    width?: number | `${number}`;
    height?: number | `${number}`;
}

export function StudiFyLogo({ width = 48, height = 48, ...props }: StudiFyLogoProps) {
    return (
        <Image
            src="/StudiFy.png"
            alt="StudiFy Logo"
            width={width}
            height={height}
            className={props.className}
            style={{ objectFit: 'contain' }}
            priority={true}
            quality={95}
        />
    );
}
