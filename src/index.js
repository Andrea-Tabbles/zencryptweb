var zencodeResults = []

// ucs-2 string to base64 encoded ascii
function utoa(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
// base64 encoded ascii to ucs-2 string
function atou(str) {
    return decodeURIComponent(escape(atob(str)));
}

var ZC = (function() {
    let bobKeys = null
    let aliceKeys = null

    const init = function() {
        generateKeys()
        setupForm()
    };

    const generateKeys = () => {
        zencode(`Scenario 'simple': $scenario
                 Given that I am known as 'Bob'
                 When I create my new keypair
                 Then print my data`, null, null)
        bobKeys = JSON.parse(zencodeResults.pop())
        $("#bob").html(JSON.stringify({Bob: { public: bobKeys.Bob.keypair.public_key}}))

        zencode(`Scenario 'simple': $scenario
                 Given that I am known as 'Alice'
                 When I create my new keypair
                 Then print my data`, null, null)
        aliceKeys = JSON.parse(zencodeResults.pop())
        $("#alice").html(JSON.stringify(aliceKeys))
    }

    const setupForm = () => {
        const form = document.querySelector('form')

        form.addEventListener('submit', e => {
            e.preventDefault()

            const file = document.querySelector('[type=file]').files[0]
            const reader = new FileReader();
            reader.onloadend = evt => {
                if (evt.target.readyState == FileReader.DONE) {
                    encrypt(evt.target.result)
                }
            }
            reader.readAsText(file, "UTF-8")
        })
    }

    const encrypt = (rawContent) => {
        const encodedContent = utoa(rawContent)
        const content = [
            { base64: encodedContent },
            { Bob: { public: bobKeys.Bob.keypair.public_key }}
        ]

        zencode(`Scenario 'simple': $scenario
                 Given that I am known as 'Alice'
                 and I have my 'keypair'
                 and I have inside 'Bob' a valid 'public key'
                 and I have a 'url64'
                 When I encrypt the 'url64' as 'secret message'
                 Then print the 'secret message'`,
                 JSON.stringify(aliceKeys),
                 JSON.stringify(content)
                )

        $("#result").html(zencodeResults.pop())
    }

    const zencode = function(code, keys, data) {
        let t0 = performance.now()
        Module.ccall('zencode_exec', 
                         'number',
                         ['string', 'string', 'string', 'string', 'number'],
                         [code, null, keys, data, 3]);
        let t1 = performance.now()
        console.log(t1-t0, 'ms')
    }

    return {
        init: init,
        zencode: zencode
    }
})();

var Module = {
    preRun: [],
    postRun: [],
    print: text => {
        zencodeResults.push(text)
    },
    printErr: function(text) {
        // if (arguments.length > 1)
        //     text = Array.prototype.slice.call(arguments).join(' ')
        console.error(text)
    },
    exec_ok: () => {},
    exec_error: () => {},
    onRuntimeInitialized: function () {
        ZC.init()
    }
}