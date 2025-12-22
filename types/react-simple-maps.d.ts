declare module 'react-simple-maps' {
    import { ComponentType, ReactNode, CSSProperties } from 'react';

    interface ComposableMapProps {
        projection?: string;
        projectionConfig?: {
            scale?: number;
            center?: [number, number];
            rotate?: [number, number, number];
        };
        width?: number;
        height?: number;
        style?: CSSProperties;
        children?: ReactNode;
    }

    interface ZoomableGroupProps {
        center?: [number, number];
        zoom?: number;
        minZoom?: number;
        maxZoom?: number;
        translateExtent?: [[number, number], [number, number]];
        onMoveStart?: (position: { coordinates: [number, number]; zoom: number }) => void;
        onMove?: (position: { coordinates: [number, number]; zoom: number }) => void;
        onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
        children?: ReactNode;
    }

    interface GeographiesProps {
        geography: string | object;
        children: (data: { geographies: any[] }) => ReactNode;
    }

    interface GeographyProps {
        geography: any;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        style?: {
            default?: CSSProperties;
            hover?: CSSProperties;
            pressed?: CSSProperties;
        };
        onMouseEnter?: (event: React.MouseEvent) => void;
        onMouseLeave?: (event: React.MouseEvent) => void;
        onClick?: (event: React.MouseEvent) => void;
    }

    interface MarkerProps {
        coordinates: [number, number];
        onClick?: (event: React.MouseEvent) => void;
        onMouseEnter?: (event: React.MouseEvent) => void;
        onMouseLeave?: (event: React.MouseEvent) => void;
        children?: ReactNode;
    }

    interface LineProps {
        coordinates: [number, number][];
        stroke?: string;
        strokeWidth?: number;
        strokeLinecap?: string;
        children?: ReactNode;
    }

    interface AnnotationProps {
        subject: [number, number];
        dx?: number;
        dy?: number;
        curve?: number;
        connectorProps?: object;
        children?: ReactNode;
    }

    interface SphereProps {
        id?: string;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
    }

    interface GraticuleProps {
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        step?: [number, number];
    }

    export const ComposableMap: ComponentType<ComposableMapProps>;
    export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
    export const Geographies: ComponentType<GeographiesProps>;
    export const Geography: ComponentType<GeographyProps>;
    export const Marker: ComponentType<MarkerProps>;
    export const Line: ComponentType<LineProps>;
    export const Annotation: ComponentType<AnnotationProps>;
    export const Sphere: ComponentType<SphereProps>;
    export const Graticule: ComponentType<GraticuleProps>;
}
