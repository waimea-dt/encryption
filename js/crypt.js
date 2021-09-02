const plainCharContainer  = document.getElementById( 'plaintext-chars' );
const plainInput          = document.getElementById( 'plaintext-text' );
const plainChart          = document.getElementById( 'plaintext-chart' );
const cypherCharContainer = document.getElementById( 'cyphertext-chars' );
const cypherInput         = document.getElementById( 'cyphertext-text' );
const cypherChart         = document.getElementById( 'cyphertext-chart' );
const mappingContainer    = document.getElementById( 'mapping' );
const mappingDirection    = document.getElementById( 'mapping-direction' );

const keyValue            = document.getElementById( 'key-value' );
const keyInput            = document.getElementById( 'key-text' );
const keyStreamInput      = document.getElementById( 'key-stream' );

const CURSOR  = 1;
const SPACE   = 2;
const ALPHA   = 4;
const NUMERIC = 8;

const CAESAR  = 1;
const VIGNERE = 2;

let scheme = CAESAR;
let plainChars = [];
let cypherRows = [];
let cypherChars = [];
let mappings = [];
let plainBars = [];
let cypherBars= [];


if( keyValue ) {
    keyValue.addEventListener( 'input', () => { setup(); } );
    keyValue.addEventListener( 'keydown', (event) => { filterKey( event, CURSOR | NUMERIC ); } );
}

if( keyInput ) {
    keyInput.addEventListener( 'input', (event) => { crypt( plainInput, cypherInput, 'ENCRYPT' ); } );
    keyInput.addEventListener( 'keydown', (event) => { filterKey( event, CURSOR | ALPHA ); } );
    keyInput.addEventListener( 'keyup', () => { syncCursor( keyInput, plainInput, cypherInput ); } );
}

plainInput.addEventListener(  'focus', switchToEncryption );
cypherInput.addEventListener( 'focus', switchToDecryption );

plainInput.addEventListener(  'input', (event) => { crypt( plainInput, cypherInput, 'ENCRYPT', event ); } );
cypherInput.addEventListener( 'input', (event) => { crypt( cypherInput, plainInput, 'DECRYPT', event ); } );

plainInput.addEventListener(  'keydown', (event) => { filterKey( event ); } );
cypherInput.addEventListener( 'keydown', (event) => { filterKey( event ); } );

plainInput.addEventListener(  'keyup', () => { syncCursor( plainInput, cypherInput ); } );
cypherInput.addEventListener( 'keyup', () => { syncCursor( cypherInput, plainInput ); } );


function setup( newScheme=null ) {
    if( newScheme ) scheme = newScheme;
    document.body.classList.add( 'scheme-' + (scheme == CAESAR ? 'caesar' : 'vignere') );
    console.log( 'Scheme: ' + scheme );

    if( plainInput.value.length == 0 ) plainInput.value = 'ENTER A MESSAGE';

    if( scheme == CAESAR  && keyValue.value.length == 0 ) keyValue.value = 0;
    if( scheme == VIGNERE && keyInput.value.length == 0 ) keyInput.value = 'SECRET';

    setupPlainChars();
    setupCypherChars();
    setupMappings();
    setupCharts();
   
    if( cypherInput === document.activeElement ) {
        crypt( cypherInput, plainInput, 'DECRYPT' );
        cypherInput.setSelectionRange( cypherInput.value.length, cypherInput.value.length );
        syncCursor( cypherInput, plainInput );
    }
    else {
        crypt( plainInput, cypherInput, 'ENCRYPT' );
        plainInput.setSelectionRange( plainInput.value.length, plainInput.value.length );
        syncCursor( plainInput, cypherInput );
    }

}


function setupPlainChars() {
    plainChars  = [];
    plainCharContainer.innerHTML  = '';

    // Add spacers for grid
    if( scheme == VIGNERE ) {
        plainCharContainer.append( document.createElement( 'span' ) );
        plainCharContainer.append( document.createElement( 'span' ) );
    }

    for( let i = 0; i < 26; i++ ) {
        const ascii = 65 + i
        const charText  = String.fromCharCode( ascii );
        
        const char = document.createElement( 'span' );
        char.classList.add( 'char' );
        char.classList.add( 'plain' );
        if( ascii == 65 ) char.classList.add( 'start' );
        char.innerHTML = charText;
        plainCharContainer.append( char );
        plainChars.push( char );
    }
}

function setupCypherChars() {
    cypherRows = [];
    cypherChars = [];
    cypherCharContainer.innerHTML = '';

    const rows = scheme == CAESAR ? 1 : 26;

    for( let row = 0; row < rows; row++ ) {
        // Do we have a Caesar shift value, or a Vignere shift by row?
        const shift = scheme == CAESAR ? parseInt( keyValue.value ) : row;
        const rowContainer = document.createElement( 'div' );
        rowContainer.classList.add( 'row' );
        rowContainer.classList.add( 'grid' );
        cypherCharContainer.append( rowContainer );
        cypherRows.push( rowContainer );

        if( scheme == VIGNERE ) {
            const label = document.createElement( 'span' );
            label.classList.add( 'label' );
            label.classList.add( 'char' );
            label.innerHTML = String.fromCharCode( 65 + row );
            rowContainer.append( label );
            rowContainer.append( document.createElement( 'span' ) );
        }

        for( let i = 0; i < 26; i++ ) {
            const ascii = (i + shift) < 26 ? (65 + i + shift) : (65 + i + shift - 26);
            const charText = String.fromCharCode( ascii );
            
            const char = document.createElement( 'span' );
            char.classList.add( 'char' );
            char.classList.add( 'cypher' );
            if( ascii == 65 ) char.classList.add( 'start' );
            char.innerHTML = charText;
            rowContainer.append( char );
            cypherChars.push( char );
        }
    }
}

function setupMappings() {
    mappings = [];
    mappingContainer.innerHTML    = '';

    // Add spacers for grid
    if( scheme == VIGNERE ) {
        mappingContainer.append( document.createElement( 'span' ) );
        mappingContainer.append( document.createElement( 'span' ) );
    }

    for( let i = 0; i < 26; i++ ) {
        const char = document.createElement( 'span' );
        const up   = document.createElement( 'i' );
        const down = document.createElement( 'i' );
        // up.innerHTML   = '\u2191';
        // down.innerHTML = '\u2193';
        up.classList.add( 'icon-up' );  // Uses fontello icon font
        down.classList.add( 'icon-down' );
        down.classList.add( 'active' );
        char.append( up );
        char.append( down );
        mappingContainer.append( char );
        mappings.push( char );
    }
}


function setupCharts() {
    plainBars  = setupChart( plainChart );
    cypherBars = setupChart( cypherChart );
}


function setupChart( container ) {
    let bars = [];
    container.innerHTML = '';
    
    const barContainer = document.createElement( 'div' );
    const labelContainer = document.createElement( 'div' );

    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode( i + 65 );  
        const letterLabel = document.createElement( 'label' );
        letterLabel.innerHTML = letter;
        labelContainer.append( letterLabel );

        const letterBar = document.createElement( 'div' );
        letterBar.classList.add( 'bar' );
        bars.push( letterBar );
        barContainer.append( letterBar );

        container.append( barContainer );
        container.append( labelContainer );
    }

    return bars;
}



function updateCharts() {
    updateChart( plainInput, plainBars );
    updateChart( cypherInput, cypherBars );
}


function updateChart( input, bars ) {
    const text = input.value.toUpperCase();
    const maxHeight = 3.5; // 3.5rem
    let counts = Array( 26 ).fill( 0 );
    let maxCount = 0;
    // console.log( `Text: ${plainText}` );

    for( let i = 0; i < 26; i++ ) {
        const letter = String.fromCharCode( i + 65 );

        for (let c = 0; c < text.length; c++) {
            if( text[c] == letter ) counts[i]++;         
        }

        if( counts[i] > maxCount ) maxCount = counts[i];
        // console.log( `Letter: ${letter} = ${counts}` );
    }

    for( let i = 0; i < 26; i++ ) {
        const height = maxCount == 0 ? 0 : (counts[i] / maxCount) * maxHeight;
        bars[i].style.height = height + 'rem';
    }
}



function crypt( fromInput, toInput, direction='ENCRYPT', event=null ) {
         if( scheme == CAESAR )   caesar( fromInput, toInput, direction, event ); 
    else if( scheme == VIGNERE ) vignere( fromInput, toInput, direction, event );

    updateCharts();
}


function caesar( fromInput, toInput, direction='ENCRYPT', event=null ) {
    const fromText = fromInput.value.toUpperCase();
    const shift = parseInt( keyValue.value ) * (direction == 'ENCRYPT' ? 1 : -1);

    let toText = '';
    for (let i = 0; i < fromText.length; i++) {
        const ascii = fromText.charCodeAt( i );
        let newAscii = ascii;

        if( ascii >= 65 && ascii < 65 + 26 ) {
            newAscii = ascii + shift;
            if( newAscii >= (65 + 26) ) newAscii -= 26;
            else if( newAscii < 65 ) newAscii += 26;
        }

        toText += String.fromCharCode( newAscii );
    }

    toInput.value = toText;

    if( event && event.inputType == 'insertText' ) {
        const letter = event.data.toUpperCase();
        const ascii = letter.charCodeAt( 0 );
        let offset = ascii - 65;
        if( direction == 'DECRYPT' ) offset = (offset + shift + 26) % 26;
        highlightMapping( offset );
    }

    syncCursor( fromInput, toInput );
}


function vignere( fromInput, toInput, direction='ENCRYPT', event=null ) {
    const fromText = fromInput.value.toUpperCase();

    const keyStreamText = keyStream( fromText.length );
    keyStreamInput.value = keyStreamText;
    
    let toText = '';
    for (let i = 0; i < fromText.length; i++) {
        const ascii = fromText.charCodeAt( i );
        let shift = keyStreamText.charCodeAt( i ) - 65;
        shift *= direction == 'ENCRYPT' ? 1 : -1;

        let newAscii = ascii;

        if( ascii >= 65 && ascii < 65 + 26 ) {
            newAscii = ascii + shift;
            if( newAscii >= (65 + 26) ) newAscii -= 26;
            else if( newAscii < 65 ) newAscii += 26;
        }

        toText += String.fromCharCode( newAscii );
    }

    toInput.value = toText;

    if( event && event.inputType == 'insertText' ) {
        const cursorPosition = fromInput.selectionStart;
        const shift = keyStreamText.charCodeAt(cursorPosition - 1) - 65;
        const letter = event.data.toUpperCase();
        const ascii = letter.charCodeAt( 0 );
        let offset = ascii - 65;
        if( direction == 'DECRYPT' ) offset = (offset - shift + 26) % 26;
        highlightMapping( offset, shift );
    }

    syncCursor( fromInput, toInput );
}


function keyStream( length ) {
    const key = keyInput.value.toUpperCase();
    let stream = '';

    for( let i = 0; i < length; i++ ) {
        stream += key[i % key.length];
    }

    return stream;
}

function highlightMapping( offset, highlightRow=0 ) {
    if( offset >= 0 && offset < 26 && highlightRow >= 0 && highlightRow < 26 ) {
        clearHighlights();

        plainChars[offset].classList.add( 'highlight' );
        mappings[offset].classList.add( 'highlight' );
        cypherRows[highlightRow].classList.add( 'highlight' );
        cypherChars[offset + (26 * highlightRow)].classList.add( 'highlight' );
    }
}


function clearHighlights() {
    const maxRows = scheme == CAESAR ? 1 : 26;

    for( let row = 0; row < maxRows; row++ ) {
        cypherRows[row].classList.remove( 'highlight' );

        for( let i = 0; i < 26; i++ ) {
            plainChars[i].classList.remove( 'highlight' );
            mappings[i].classList.remove( 'highlight' );
            cypherChars[(26 * row) + i].classList.remove( 'highlight' );
        }
    }
}


function filterKey( event, allow=CURSOR|ALPHA|SPACE ) {
    // console.log( `Allow: C${allow & CURSOR} S${allow & SPACE} A${allow & ALPHA} N${allow & NUMERIC}` );

    const keyCode = event.which || event.keyCode;
    // console.log( 'Key: ' + keyCode );

    // Allow DEL, BS, SPC, ARROWS, HOME, END, A-Z
    if( (allow & CURSOR) > 0 && (
            keyCode == 8 || 
            keyCode == 46 || 
            (keyCode >= 35 && keyCode <= 40)
        ) ) {  
        // console.log( 'Key: cursor' );
        clearHighlights();
        return true;
    }
    else if( (allow & SPACE) > 0 && keyCode == 32 ) {  
        // console.log( 'Key: space' );
        return true;
    }
    else if( (allow & ALPHA) > 0 && (keyCode >= 65 && keyCode < 65 + 26) ) {
        // console.log( 'Key: alpha' );
        return true;
    }
    else if( (allow & NUMERIC) > 0 && (keyCode >= 48 && keyCode < 48 + 10) ) {
        // console.log( 'Key: num' );
        return true;
    }
    else {
        event.preventDefault();
        return false;
    }
}


function syncCursor( fromInput, toInput ) {
    toInput.setSelectionRange( fromInput.selectionStart, fromInput.selectionStart );
    if( keyStreamInput ) keyStreamInput.setSelectionRange( fromInput.selectionStart, fromInput.selectionStart );
}


function switchToEncryption() {
    mappings.forEach( mapping => {
        // up arrows
        mapping.firstChild.classList.remove( 'active' );  
        // down arrows
        mapping.lastChild.classList.add( 'active' );  
    } );

    mappingDirection.innerHTML = 'Encrypts to';
}


function switchToDecryption() {
    mappings.forEach( mapping => {
        // up arrows
        mapping.firstChild.classList.add( 'active' );  
        // down arrows
        mapping.lastChild.classList.remove( 'active' );  
    } );

    mappingDirection.innerHTML = 'Decrypts to';
}