import './keyboard.scss';
import {
    useRef,
    useState,
    useEffect
} from 'react';

import useEventListener from '../../hooks/useEventListener';

export default function Keyboard() {
    const keyboardRef = useRef(null);
    const [ignoreKey, setIgnoreKey] = useState(false);
    const [word, setWord] = useState<string>('');
    const [dictionary, setDictionary] = useState<Array<string>>();
    
    useEffect(() => {
        fetch(process.env.PUBLIC_URL + 'targetWords.json')
            .then((res) => res.json())
            .then((data) => {
                setWord(data[Math.floor((Date.now() - new Date(2022, 0, 1).getTime()) / 1000 / 60 / 60 / 24)]);
            });
        fetch(process.env.PUBLIC_URL + 'dictionary.json')
            .then((res) => res.json())
            .then((data) => {
                setDictionary(data);
            });
    }, []);

    const toast = (text: string, duration = 1000) => {
        const toast = document.createElement('div');
        toast.textContent = text;
        toast.classList.add('toast');
        document.querySelector('section#Toaster')!.prepend(toast);
        setTimeout(() => {
            toast.classList.add("hide");
            toast.addEventListener("transitionend", () => {
                toast.remove();
            });
        }, duration);
    };

    const getActiveTiles = () => {
        return document.querySelector('section#Board')!.querySelectorAll('[data-state="active"]') as NodeListOf<HTMLDivElement>;
    };
    const shakeTiles = (tiles: Array<HTMLDivElement>) => {
        if(tiles.length < 5) tiles.push(...[...document.querySelector('section#Board')?.querySelectorAll(':not([data-state="active"])') as NodeListOf<HTMLDivElement>].splice(0, 5 - tiles.length));
        tiles.forEach(tile => {
            tile.classList.add("shake");
            tile.addEventListener("animationend", () => {
                tile.classList.remove("shake");
            }, { once: true });
        });
    };
    const flipTiles = (tiles: Array<HTMLDivElement>, wordGuessed: string) => {
        setIgnoreKey(true);
        tiles.forEach((val, i) => {
            setTimeout(() => {
                val.classList.add('flip');
            }, i * 500 / 2);
            val.addEventListener('transitionend', () => {
                val.classList.remove('flip');
                const key = (keyboardRef.current as unknown as HTMLDivElement).querySelector(`[data-key='${val.textContent}']`)!;
                if(val.textContent === word[i]) {
                    val.dataset.state = 'correct';
                    key.classList.add('correct');
                } else if(word.includes(val.textContent!)) {
                    val.dataset.state = 'present';
                    key.classList.add('present');
                } else {
                    val.dataset.state = 'absent';
                    key.classList.add('absent');
                };
                if(i === 4) {
                    if(wordGuessed === word) {
                        toast('Genius', 3000);
                        tiles.forEach((val, i) => {
                            setTimeout(() => {
                                val.classList.add("dance");
                                val.addEventListener("animationend", () => {
                                    val.classList.remove("dance");
                                }, { once: true });
                            }, i * 500 / 5);
                        });
                    } else setIgnoreKey(false);
                };
            }, { once: true });
        });
    };
    const enterKey = (letter: string) => {
        if(getActiveTiles().length >= 5) return;
        const tile = document.querySelector('section#Board')?.querySelector(':not([data-state])') as HTMLDivElement;
        tile.textContent = letter;
        tile.dataset.state = "active";
        tile.classList.add("keyPress");
        tile.addEventListener("animationend", () => {
            tile.classList.remove("keyPress");
        }, { once: true });
    };
    const deleteKey = () => {
        const activeTiles = getActiveTiles();
        const lastTile = activeTiles[activeTiles.length - 1];
        if(lastTile) {
            lastTile.textContent = '';
            delete lastTile.dataset.state;
            delete lastTile.dataset.letter;
        };
    };
    const submitGuess = () => {
        const activeTiles = [...getActiveTiles()]
        if(activeTiles.length !== 5) {
            shakeTiles(activeTiles)
            return toast('Not enough Letters');
        };
        const wordGuessed = activeTiles.reduce((word, tile) => word + tile.textContent, '');
        if(!dictionary?.includes(wordGuessed)) {
            shakeTiles(activeTiles)
            return toast('Not in word list');
        };
        setIgnoreKey(true);
        flipTiles(activeTiles, wordGuessed);
    };

    const onKeyClick = (event: any) => {
        if(ignoreKey) return;
        const target = event.target as HTMLDivElement;
        if(target.dataset.key === 'enter') submitGuess();
        else if(target.dataset.key === 'delete' || target.tagName === 'SVG') deleteKey();
        else if(/^[a-z]$/.test(target.dataset.key!)) enterKey(target.dataset.key!);
    };

    useEventListener('keydown', event => {
        if(ignoreKey) return;
        switch(event.key) {
            case 'Enter':
                submitGuess()
            break;
            case 'Backspace':
            case 'Delete':
                deleteKey();
            break;
            case String(event.key.match(/^[a-z]$/)):
                enterKey(event.key);
            break;
        };
    });

    return (
        <section id='Keyboard' ref={ keyboardRef }>
            {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((val, i) => {
                return (
                    <button key={ i } data-key={ val } className="key" onClick={ onKeyClick }>{val}</button>
                );
            })}
            <div/>
            {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((val, i) => {
                return (
                    <button key={ i } data-key={ val } className="key" onClick={ onKeyClick }>{val}</button>
                );
            })}
            <div/>
            <button data-key='enter' className="key column-3" onClick={ onKeyClick }>Enter</button>
            {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((val, i) => {
                return (
                    <button key={ i } data-key={ val } className="key" onClick={ onKeyClick }>{val}</button>
                );
            })}
            <button data-key='delete' className="key column-3" onClick={ onKeyClick }>
                <svg data-key='delete' xmlns="http://www.w3.org/2000/svg" height="60" viewBox="0 0 24 24" width="24">
                    <path data-key='delete' fill="var(--color-tone-1)" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
                </svg>
            </button>
        </section>
    )
};