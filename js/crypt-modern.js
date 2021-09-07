const plaintextA  = document.getElementById( 'plaintext-text-A' );
const plaintextB  = document.getElementById( 'plaintext-text-B' );
const plaintextE  = document.getElementById( 'plaintext-text-E' );
const plainChart  = document.getElementById( 'plaintext-chart' );

const cyphertextA = document.getElementById( 'cyphertext-text-A' );
const cyphertextB = document.getElementById( 'cyphertext-text-B' );
const cyphertextE = document.getElementById( 'cyphertext-text-E' );
const cypherChart = document.getElementById( 'cyphertext-chart' );

const keyA = document.getElementById( 'key-A' );
const keyB = document.getElementById( 'key-B' );
const keyE = document.getElementById( 'key-E' );

const keyAPrivate = document.getElementById( 'key-A-private' );
const keyAPublic  = document.getElementById( 'key-A-public' );
const keyBPrivate = document.getElementById( 'key-B-private' );
const keyBPublic  = document.getElementById( 'key-B-public' );
const keyEA       = document.getElementById( 'key-EA' );
const keyEB       = document.getElementById( 'key-EB' );

const transmission = document.getElementById( 'transmission' );
const transmitAB   = document.getElementById( 'transmit-atob' );
const transmitBA   = document.getElementById( 'transmit-btoa' );
const ATOB = 1;
const BTOA = 2;

const keyGenA        = document.getElementById( 'key-gen-A' );
const keyGenB        = document.getElementById( 'key-gen-B' );
const keySendAB      = document.getElementById( 'key-send-AtoB' );
const keySendBA      = document.getElementById( 'key-send-BtoA' );
const plainExcrypt   = document.getElementById( 'plaintext-encrypt' );
const cypherSend     = document.getElementById( 'cyphertext-send' );
const cypherDecryptB = document.getElementById( 'cyphertext-decrypt-B' );
const cypherDecryptE = document.getElementById( 'cyphertext-decrypt-E' );

const DEFAULTMESSAGE = 'This is a secret message';
const DECRYPTERROR   = '*** DECRYPTION ERROR ***';

const ANIMATIONTIME = 1000;

const SYMMETRIC  = 1;
const ASYMMETRIC = 2;

const cyphers = {
    1: {
        name: 'symmetric'
    },
    2: {
        name: 'asymmetric'
    }
}

let scheme = SYMMETRIC;

const symmetricNonce  = nacl.randomBytes( nacl.secretbox.nonceLength );
const asymmetricNonce = nacl.randomBytes( nacl.box.nonceLength );

let plainBars = {};
let cypherBars= {};

// plaintextA.addEventListener( 'keydown', (event) => { filterKey( event, CURSOR | SPACE | ALPHA | NUMERIC ); } );
plaintextA.addEventListener( 'input', () => { encrypt( plaintextA, cyphertextA, keyA, keyAPrivate ); } );

if( keyGenA ) keyGenA.addEventListener( 'click', () => { 
    if( scheme == SYMMETRIC )  createKey( keyA );
    if( scheme == ASYMMETRIC ) createKey( keyAPrivate, keyAPublic ); 
    cyphertextA.value = ''; 
} );
if( keyGenB ) keyGenB.addEventListener( 'click', () => { 
    if( scheme == SYMMETRIC )  createKey( keyB );
    if( scheme == ASYMMETRIC ) createKey( keyBPrivate, keyBPublic ); 
    cyphertextB.value = ''; 
} );

if( keySendAB ) keySendAB.addEventListener( 'click', () => { 
    if( scheme == SYMMETRIC )  { transmit( keyA, keyB ); transmit( keyA, keyE ); } 
    if( scheme == ASYMMETRIC ) { transmit( keyAPublic, keyB ); transmit( keyAPublic, keyEA ); }
    setTimeout( () => { plaintextB.value = ''; }, 500 );
} );
if( keySendBA ) keySendBA.addEventListener( 'click', () => { 
    if( scheme == SYMMETRIC )  { transmit( keyB, keyA, BTOA ); transmit( keyB, keyE, BTOA ); }
    if( scheme == ASYMMETRIC ) { transmit( keyBPublic, keyA, BTOA ); transmit( keyBPublic, keyEB, BTOA ); }
    setTimeout( () => { cyphertextA.value = ''; plaintextE.value = ''; }, 500 );
} );

cypherSend.addEventListener(  'click', () => { 
    transmit( cyphertextA, cyphertextB ); 
    transmit( cyphertextA, cyphertextE ); 
    setTimeout( () => { plaintextB.value = ''; plaintextE.value = ''; }, 500 );
} );

plainExcrypt.addEventListener(   'click', () => { encrypt( plaintextA, cyphertextA, keyA, keyAPrivate ); } );
cypherDecryptB.addEventListener( 'click', () => { decrypt( cyphertextB, plaintextB, keyB, keyBPrivate ); } );

cypherDecryptE.addEventListener( 'click', () => { 
    if( scheme == SYMMETRIC )  decrypt( cyphertextE, plaintextE, keyE );
    if( scheme == ASYMMETRIC ) decrypt( cyphertextE, plaintextE, keyEA, keyEB );
} );


function setup( newScheme=null ) {
    if( newScheme ) scheme = newScheme;
    document.body.classList.add( 'scheme-' + cyphers[scheme].name );
    console.log( 'Scheme: ' + cyphers[scheme].name );

    if( plaintextA.value.length == 0 ) {
        plaintextA.value = DEFAULTMESSAGE;
    }

    if( keyA )        keyA.value = '';
    if( keyB )        keyB.value = '';
    if( keyE )        keyE.value = '';
    if( keyAPrivate ) keyAPrivate.value = '';
    if( keyAPublic )  keyAPublic.value = '';
    if( keyBPrivate ) keyBPrivate.value = '';
    if( keyBPublic )  keyBPublic.value = '';
    if( keyEA )       keyEA.value = '';
    if( keyEB )       keyEB.value = '';

    plaintextB.value = '';
    plaintextE.value = '';
    cyphertextA.value = '';
    cyphertextB.value = '';
    cyphertextE.value = '';

    setupCharts();         
    updateCharts();
  
    plaintextA.setSelectionRange( plaintextA.value.length, plaintextA.value.length );
}


function setupCharts() {
    if( plainChart && cypherChart ) {
        plainBars  = setupChart( plainChart,  UPPER|LOWER|NUMERIC );
        cypherBars = setupChart( cypherChart, UPPER|LOWER|NUMERIC );
    }
}


function updateCharts() {
    if( plainChart && cypherChart ) {
        updateChart( plaintextA.value,  plainBars );
        updateChart( cyphertextA.value, cypherBars );
    }
}



function encrypt( fromInput, toInput, keyInput, keyPrivateInput=null ) {
    if( fromInput.value.length == 0 || keyInput.value.length == 0 ||
        (scheme == ASYMMETRIC && (!keyPrivateInput || keyPrivateInput.value.length == 0)) ) {
        toInput.value = '';        
        updateCharts();
        return;
    }
    
    const key = nacl.util.decodeBase64( keyInput.value );
    const messageBytes = nacl.util.decodeUTF8( fromInput.value );
    let encryptedBytes;
    let nonce;

    if( scheme == SYMMETRIC ) {
        nonce = symmetricNonce;
        encryptedBytes = nacl.secretbox( messageBytes, nonce, key );
    }
    else {
        nonce = asymmetricNonce;
        const privateKey = nacl.util.decodeBase64( keyPrivateInput.value );
        encryptedBytes = nacl.box( messageBytes, nonce , key, privateKey );
    }

    const encryptedFull = new Uint8Array( nonce.length + encryptedBytes.length );
    encryptedFull.set( encryptedBytes );
    encryptedFull.set( nonce, encryptedBytes.length );

    const encryptedReadable = nacl.util.encodeBase64( encryptedFull );

    fromInput.classList.add( 'using' );
    // if( keyPrivateInput ) keyPrivateInput.classList.add( 'using' ); 
    // else                  
    keyInput.classList.add( 'using' );

    toInput.value = '';

    setTimeout( () => {
        toInput.classList.add( 'using' );
        toInput.value = encryptedReadable;
        updateCharts();

        setTimeout( () => {
            toInput.classList.remove( 'using' );
            fromInput.classList.remove( 'using' );
            if( keyPrivateInput ) keyPrivateInput.classList.remove( 'using' ); 
            keyInput.classList.remove( 'using' );
        }, ANIMATIONTIME );
    }, ANIMATIONTIME );
}


function decrypt( fromInput, toInput, keyInput, keyPrivateInput=null ) {
    console.log( fromInput );
    console.log( toInput );
    console.log( keyInput );
    console.log( keyPrivateInput );
    
    if( fromInput.value.length == 0 || keyInput.value.length == 0 ||
        (scheme == ASYMMETRIC && (!keyPrivateInput || keyPrivateInput.value.length == 0)) ) {
        toInput.value = '';        
        return;
    }

    const key = nacl.util.decodeBase64( keyInput.value );

    const encryptedBytes = nacl.util.decodeBase64( fromInput.value );

    const messageLen = encryptedBytes.length - (scheme == SYMMETRIC ? nacl.secretbox.nonceLength : nacl.box.nonceLength);
    const encryptedMessage = encryptedBytes.slice( 0, messageLen );
    const encryptedNonce = encryptedBytes.slice( messageLen, encryptedBytes.length );
    let decryptedBytes;
    
    if( scheme == SYMMETRIC ) {
        decryptedBytes = nacl.secretbox.open( encryptedMessage, encryptedNonce, key );
    }
    else {
        privateKey = nacl.util.decodeBase64( keyPrivateInput.value );
        decryptedBytes = nacl.box.open( encryptedMessage, encryptedNonce, key, privateKey );
    }

    fromInput.classList.add( 'using' );
    if( keyPrivateInput ) keyPrivateInput.classList.add( 'using' ); 
    else                  keyInput.classList.add( 'using' );

    toInput.value = '';

    setTimeout( () => {
        toInput.classList.add( 'using' );

        if( decryptedBytes ) { 
            toInput.value = nacl.util.encodeUTF8( decryptedBytes );
        }
        else {
            toInput.value = DECRYPTERROR + ' ' + nacl.util.encodeBase64( nacl.randomBytes( encryptedBytes.length ) ).replace( /\//g, '' );
        }
    
        setTimeout( () => {
            toInput.classList.remove( 'using' );
            fromInput.classList.remove( 'using' );
            if( keyPrivateInput ) keyPrivateInput.classList.remove( 'using' ); 
            keyInput.classList.remove( 'using' );
    
            }, ANIMATIONTIME );
    }, ANIMATIONTIME );
}


function createKey( keyInputPrivate, keyInputPublic=null ) {
    const naclPair = nacl.box.keyPair();
    keyInputPrivate.value = nacl.util.encodeBase64( naclPair.secretKey );
    if( keyInputPublic ) keyInputPublic.value = nacl.util.encodeBase64( naclPair.publicKey );
}


function transmit( from, to, direction=ATOB ) {
    if( from.value.length > 0 ) {
        from.classList.add( 'sending' );

        transmission.classList.add( 'sending' );
        if( transmitAB && transmitBA ) {
            transmitAB.style.display = direction == ATOB ? 'block' : 'none'; 
            transmitBA.style.display = direction == ATOB ? 'none' : 'block'; 
        }

        setTimeout( () => { 
            to.value = '';
            to.classList.add( 'receiving' );
            
            sendText( from.value, from, to ); 
            // setTimeout( () => { 
            // }, ANIMATIONTIME );
        }, ANIMATIONTIME );
    }
}


function sendText( text, source, target ) {
    const MAXLEN = 300;

    let end = text.length > MAXLEN ? MAXLEN : text.length;
    let i = 0;

    const timer = setInterval( function sendChar() {
        if( i < end ) {
            target.value += text[i++];
            target.setSelectionRange( target.value.length, target.value.length );
        }
        else {
            clearInterval( timer );
            target.value += text.substring( MAXLEN );
            target.setSelectionRange( 0, 0 );
            target.srollTop = 0;

            setTimeout( () => {
                source.classList.remove( 'sending' );       
                target.classList.remove( 'receiving' );
            
                transmission.classList.remove( 'sending' );
                if( transmitAB && transmitBA ) {
                    transmitAB.style.display = 'block'; 
                    transmitBA.style.display = 'block'; 
                }
            }, ANIMATIONTIME );
        }
    }, 2 );
}



