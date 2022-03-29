import {
    useEffect,
    useRef,
    RefObject
} from "react";

export default function useEventListener<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => void): void;
export default function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLDivElement>(type: K, listener: (event: HTMLElementEventMap[K]) => void, element: RefObject<T>): void;
export default function useEventListener<KW extends keyof WindowEventMap, KH extends keyof HTMLElementEventMap, T extends HTMLElement | void = void>(type: KW | KH, listener: (event: WindowEventMap[KW] | HTMLElementEventMap[KH] | Event) => void, element?: RefObject<T>) {
    const savedHandler = useRef<typeof listener>();
    
    useEffect(() => {
        const targetElement: T | Window = element?.current || window;

        if(!(targetElement && targetElement.addEventListener)) return;
        if (savedHandler.current !== listener) savedHandler.current = listener;
        
        const eventListener: typeof listener = event => {
            if(!!savedHandler?.current) savedHandler.current(event)
        };
    
        targetElement.addEventListener(type, eventListener)

        return () => {
            targetElement.removeEventListener(type, eventListener);
        };
    }, [type, element, listener]);
};