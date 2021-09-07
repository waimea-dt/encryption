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

const DEFAULTMESSAGE = 'THIS IS A SECRET MESSAGE';
const DEFAULTKEY = 'A'
const DEFAULTSHIFT = 0;

const CAESAR  = 1;
const VIGNERE = 2;
const PIGPEN  = 3;

const cyphers = {
    1: {
        name: 'caesar',
        rows: 1
    },
    2: {
        name: 'vignere',
        rows: LETTERS
    },
    3:  {
        name: 'pigpen',
        rows: 1
    }
}

let scheme = CAESAR;
let plainChars = [];
let cypherRows = [];
let cypherChars = [];
let mappings = [];
let plainBars = {};
let cypherBars= {};


if( keyValue ) {
    keyValue.addEventListener( 'input', () => { setup(); } );
    keyValue.addEventListener( 'keydown', (event) => { if( filterKey( event, CURSOR | NUMERIC ) == CURSOR ) clearHighlights(); } );
}

if( keyInput ) {
    keyInput.addEventListener( 'input', (event) => { crypt( plainInput, cypherInput, 'ENCRYPT' ); } );
    keyInput.addEventListener( 'keydown', (event) => { if( filterKey( event, CURSOR | ALPHA ) == CURSOR ) clearHighlights(); } );
    keyInput.addEventListener( 'keyup', () => { syncCursor( keyInput, plainInput, cypherInput ); } );
}

plainInput.addEventListener(  'focus', switchToEncryption );
cypherInput.addEventListener( 'focus', switchToDecryption );

plainInput.addEventListener(  'input', (event) => { crypt( plainInput, cypherInput, 'ENCRYPT', event ); } );
cypherInput.addEventListener( 'input', (event) => { crypt( cypherInput, plainInput, 'DECRYPT', event ); } );

plainInput.addEventListener(  'keydown', (event) => { if( filterKey( event ) == CURSOR ) clearHighlights(); } );
cypherInput.addEventListener( 'keydown', (event) => { if( filterKey( event ) == CURSOR ) clearHighlights(); } );

plainInput.addEventListener(  'keyup', () => { syncCursor( plainInput, cypherInput ); } );
cypherInput.addEventListener( 'keyup', () => { syncCursor( cypherInput, plainInput ); } );


function setup( newScheme=null ) {
    if( newScheme ) scheme = newScheme;
    document.body.classList.add( 'scheme-' + cyphers[scheme].name );
    console.log( 'Scheme: ' + cyphers[scheme].name );

    if( plainInput.value.length == 0 ) plainInput.value = DEFAULTMESSAGE;

    if( scheme == CAESAR  && keyValue.value.length == 0 ) keyValue.value = DEFAULTSHIFT;
    if( scheme == VIGNERE && keyInput.value.length == 0 ) keyInput.value = DEFAULTKEY;

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

    for( let i = 0; i < LETTERS; i++ ) {
        const ascii = CAPA + i
        const charText  = String.fromCharCode( ascii );
        
        const char = document.createElement( 'span' );
        char.classList.add( 'char' );
        char.classList.add( 'plain' );
        if( ascii == CAPA ) char.classList.add( 'start' );
        char.innerHTML = charText;
        plainCharContainer.append( char );
        plainChars.push( char );
    }
}

function setupCypherChars() {
    cypherRows = [];
    cypherChars = [];
    cypherCharContainer.innerHTML = '';

    const rows = cyphers[scheme].rows;

    for( let row = 0; row < rows; row++ ) {
        // Do we have a Caesar shift value, a Vignere shift by row, or no shift?
        const shift = scheme == CAESAR ? parseInt( keyValue.value ) : (VIGNERE ? row : 0);
        const rowContainer = document.createElement( 'div' );
        rowContainer.classList.add( 'row' );
        rowContainer.classList.add( 'grid' );
        cypherCharContainer.append( rowContainer );
        cypherRows.push( rowContainer );

        if( scheme == VIGNERE ) {
            const label = document.createElement( 'span' );
            label.classList.add( 'label' );
            label.classList.add( 'char' );
            label.innerHTML = String.fromCharCode( CAPA + row );
            rowContainer.append( label );
            rowContainer.append( document.createElement( 'span' ) );
        }

        for( let i = 0; i < LETTERS; i++ ) {
            const ascii = (i + shift) < LETTERS ? (CAPA + i + shift) : (CAPA + i + shift - LETTERS);
            const charText = String.fromCharCode( ascii );
            
            const char = document.createElement( 'span' );
            char.classList.add( 'char' );
            char.classList.add( 'cypher' );
            if( ascii == CAPA ) char.classList.add( 'start' );
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

    for( let i = 0; i < LETTERS; i++ ) {
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


function updateCharts() {
    updateChart( plainInput.value.toUpperCase(), plainBars );
    updateChart( cypherInput.value.toUpperCase(), cypherBars );
}


function crypt( fromInput, toInput, direction='ENCRYPT', event=null ) {
    switch( scheme ) {
        case CAESAR:
            caesar( fromInput, toInput, direction, event ); 
            break;

        case VIGNERE:
            vignere( fromInput, toInput, direction, event );
            break;

        case PIGPEN:
            pigpen( fromInput, toInput, direction, event );
            break;
    }       

    updateCharts();
}


function pigpen( fromInput, toInput, direction='ENCRYPT', event=null ) {
    const fromText = fromInput.value.toUpperCase();

    let toText = fromText;
    toInput.value = toText;

    if( event && event.inputType == 'insertText' ) {
        const letter = event.data.toUpperCase();
        const ascii = letter.charCodeAt( 0 );
        let offset = ascii - CAPA;
        highlightMapping( offset );
    }

    syncCursor( fromInput, toInput );
}


function caesar( fromInput, toInput, direction='ENCRYPT', event=null ) {
    const fromText = fromInput.value.toUpperCase();
    const shift = parseInt( keyValue.value ) * (direction == 'ENCRYPT' ? 1 : -1);

    let toText = '';
    for (let i = 0; i < fromText.length; i++) {
        const ascii = fromText.charCodeAt( i );
        let newAscii = ascii;

        if( ascii >= CAPA && ascii < CAPA + LETTERS ) {
            newAscii = ascii + shift;
            if( newAscii >= (CAPA + LETTERS) ) newAscii -= LETTERS;
            else if( newAscii < CAPA ) newAscii += LETTERS;
        }

        toText += String.fromCharCode( newAscii );
    }

    toInput.value = toText;

    if( event && event.inputType == 'insertText' ) {
        const letter = event.data.toUpperCase();
        const ascii = letter.charCodeAt( 0 );
        let offset = ascii - CAPA;
        if( direction == 'DECRYPT' ) offset = (offset + shift + LETTERS) % LETTERS;
        highlightMapping( offset );
    }

    syncCursor( fromInput, toInput );
}


function vignere( fromInput, toInput, direction='ENCRYPT', event=null ) {
    const fromText = fromInput.value.toUpperCase();

    const keyStreamText = keyStream( fromText.length );
    keyStreamInput.value = keyStreamText;

    let toText = '';

    if( keyStreamText.length > 0 ) {
        for (let i = 0; i < fromText.length; i++) {
            const ascii = fromText.charCodeAt( i );
            let shift = keyStreamText.charCodeAt( i ) - CAPA;
            shift *= direction == 'ENCRYPT' ? 1 : -1;

            let newAscii = ascii;

            if( ascii >= CAPA && ascii < CAPA + LETTERS ) {
                newAscii = ascii + shift;
                if( newAscii >= (CAPA + LETTERS) ) newAscii -= LETTERS;
                else if( newAscii < CAPA ) newAscii += LETTERS;
            }

            toText += String.fromCharCode( newAscii );
        }

        if( event && event.inputType == 'insertText' ) {
            const cursorPosition = fromInput.selectionStart;
            const shift = keyStreamText.charCodeAt(cursorPosition - 1) - CAPA;
            const letter = event.data.toUpperCase();
            const ascii = letter.charCodeAt( 0 );
            let offset = ascii - CAPA;
            if( direction == 'DECRYPT' ) offset = (offset - shift + LETTERS) % LETTERS;
            highlightMapping( offset, shift );
        }

        syncCursor( fromInput, toInput );
    }
    
    toInput.value = toText;
}


function keyStream( length ) {
    const key = keyInput.value.toUpperCase();
    let stream = '';

    if( key.length > 0 ) {
        for( let i = 0; i < length; i++ ) {
            stream += key[i % key.length];
        }
    }

    return stream;
}

function highlightMapping( offset, highlightRow=0 ) {
    if( offset >= 0 && offset < LETTERS && highlightRow >= 0 && highlightRow < LETTERS ) {
        clearHighlights();

        plainChars[offset].classList.add( 'highlight' );
        mappings[offset].classList.add( 'highlight' );
        cypherRows[highlightRow].classList.add( 'highlight' );
        cypherChars[offset + (LETTERS * highlightRow)].classList.add( 'highlight' );
    }
}


function clearHighlights() {
    const maxRows = cyphers[scheme].rows;

    for( let row = 0; row < maxRows; row++ ) {
        cypherRows[row].classList.remove( 'highlight' );

        for( let i = 0; i < LETTERS; i++ ) {
            plainChars[i].classList.remove( 'highlight' );
            mappings[i].classList.remove( 'highlight' );
            cypherChars[(LETTERS * row) + i].classList.remove( 'highlight' );
        }
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