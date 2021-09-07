const CURSOR  = 1;
const SPACE   = 2;
const ALPHA   = 4;
const NUMERIC = 8;
const UPPER   = 16;
const LOWER   = 32;

const LETTERS = 26;
const NUMBERS = 10;

const CAPA = 65;
const LOWA = 97;
const NUM0 = 48;


function encodeHex( byteArray ) {
    const hexString = [... new Uint8Array( byteArray )]
        .map( x => x.toString( 16 ).toUpperCase().padStart( 2, '0' ) )
        .join( '' );
    return hexString;
}


function decodeHex( hexString ) {
    const values = hexString
        .split( '' )
        .map( (value, index, array) => [value, array[index + 1]].join( '' ) )
        .map( item => parseInt( item, 16 ) );
    // const values = hexString
    //     .split( '' )
    //     .map( hexByte => parseInt( hexByte, 16 ) );
    return Uint8Array.from( values );
}


function filterKey( event, allow=CURSOR|ALPHA|SPACE ) {
    const key = event.key;
    const keyCode = event.which || event.keyCode;

    // Allow DEL, BS, SPC, ARROWS, HOME, END, A-Z
    if( (allow & CURSOR) > 0 && (
            key == 'Delete' || 
            key == 'Backspace' || 
            key == 'ArrowUp' || 
            key == 'ArrowDown' || 
            key == 'ArrowLeft' || 
            key == 'ArrowRight' ||
            key == 'Home' ||
            key == 'End'
        ) ) {
        // console.log( 'Key: cursor' );
        return CURSOR;
    }
    else if( (allow & SPACE) > 0 && key == ' ' ) {  
        // console.log( 'Key: space' );
        return SPACE;
    }
    else if( (allow & ALPHA) > 0 && (keyCode >= CAPA && keyCode < CAPA + LETTERS) ) {
        // console.log( 'Key: alpha' );
        return ALPHA;
    }
    else if( (allow & NUMERIC) > 0 && (
            key == '0' ||
            key == '1' ||
            key == '2' ||
            key == '3' ||
            key == '4' ||
            key == '5' ||
            key == '6' ||
            key == '7' ||
            key == '8' ||
            key == '9'
        ) ) {
        // console.log( 'Key: num' );
        return NUMERIC;
    }
    else {
        event.preventDefault();
        return false;
    }
}


function setupChart( container, values=UPPER ) {
    container.innerHTML = '';
    
    const barContainer = document.createElement( 'div' );
    const labelContainer = document.createElement( 'div' );
    container.append( barContainer );
    container.append( labelContainer );

    let upperBars = {};
    let lowerBars = {};
    let numBars = {};
    
    if( (values & UPPER)   > 0 ) upperBars = addBars( barContainer, labelContainer, CAPA, LETTERS );
    if( (values & LOWER)   > 0 ) lowerBars = addBars( barContainer, labelContainer, LOWA, LETTERS );
    if( (values & NUMERIC) > 0 ) numBars   = addBars( barContainer, labelContainer, NUM0, NUMBERS );

    const bars = {...upperBars, ...lowerBars, ...numBars};
    // console.log( bars );
    return bars;
}


function addBars( barContainer, labelContainer, startChar, charCount ) {
    let bars = {};

    for( let i = 0; i < charCount; i++ ) {
        const letter = String.fromCharCode( i + startChar ); 

        const letterLabel = document.createElement( 'label' );
        letterLabel.innerHTML = letter;
        labelContainer.append( letterLabel );

        const letterBar = document.createElement( 'div' );
        letterBar.classList.add( 'bar' );
        barContainer.append( letterBar );

        bars[letter] = letterBar;
    }

    // console.log( bars );
    return bars;
}


function updateChart( text, bars ) {
    const maxHeight = 3.5; // 3.5rem
     
    let upperCounts = getCount( text, CAPA, LETTERS );
    let lowerCounts = getCount( text, LOWA, LETTERS );
    let numCounts   = getCount( text, NUM0, NUMBERS );

    const counts = {...upperCounts, ...lowerCounts, ...numCounts};
    // console.log( counts );

    let maxCount = 0;
    for( const [letter, count] of Object.entries( counts ) ) {
        if( count > maxCount ) maxCount = count;
    };

    for( const [letter, bar] of Object.entries( bars ) ) {
        const height = (maxCount == 0 || !counts[letter]) ? 0 : (counts[letter] / maxCount) * maxHeight;
        bar.style.height = height + 'rem';
    }
}



function getCount( text, startChar, charCount ) {
    let counts = {};

    for( let i = 0; i < charCount; i++ ) {
        const letter = String.fromCharCode( i + startChar );

        for (let c = 0; c < text.length; c++) {
            if( text[c] == letter ) {
                if( counts[letter] ) {
                    counts[letter]++;
                }
                else {
                    counts[letter] = 1;
                }         
            }
        }
    }

    // console.log( counts );
    return counts;
}


