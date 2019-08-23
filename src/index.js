var zencodeResults = []

function utoa(str) {
    const result = btoa(str) // unescape(encodeURIComponent(str))) //.replace(/\//g, '_').replace(/\+/g, '-');
    return result
}

var ZC = (function() {
    let bobKeys = null
    let aliceKeys = null
	let t0 = 0
	let t1 = 0

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
        $("#bob").html(JSON.stringify({Bob: { public_key: bobKeys.Bob.keypair.public_key}}))

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
        const content = [
            { base64: btoa(unescape(encodeURIComponent(rawContent))) },
            { Bob: { public_key: bobKeys.Bob.keypair.public_key }}
        ]

        zencode(`Scenario 'simple': $scenario
                 Given that I am known as 'Alice'
                 and I have my 'keypair'
                 and I have inside 'Bob' a valid 'public key'
                 and I have a 'base64'
                 When I encrypt the 'base64' to 'secret message' for 'Bob'
                 Then print the 'secret message'`,
                 JSON.stringify(aliceKeys),
                 JSON.stringify(content)
                )

        $("#result").html(zencodeResults)
    }

    const zencode = function(code, keys, data) {
        zencodeResults = []
        t0 = performance.now()
        Module.ccall('zencode_exec', 
                         'number',
                         ['string', 'string', 'string', 'string', 'number'],
                         [code, null, keys, data, 0]);
        t1 = performance.now()
        $('#speed').html(t1-t0)
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
