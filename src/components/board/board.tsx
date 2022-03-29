import './board.scss';

export default function Board() {
    return (
        <section id='Board'>
            {new Array(30).fill(1).map((_, i) => {
                return (
                    <div key={ i } className="tile"/>
                );
            })}
        </section>
    );
};