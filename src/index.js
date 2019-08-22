var ZC = (function() {
    const init = function() {
        console.log("INIT")
        const form = document.querySelector('form')

        form.addEventListener('submit', e => {
            e.preventDefault()

            const file = document.querySelector('[type=file]').files[0]
            var reader = new FileReader();
            reader.onloadend = evt => {
                if (evt.target.readyState == FileReader.DONE) {
                    console.log(evt.target.result)
                }
            }
            reader.readAsText(file, "UTF-8")
        })
    };

    const zencode = function(code, keys, data) {
        let t0 = performance.now()
        Module.ccall('zencode_exec', 
                         'number',
                         ['string', 'string', 'string', 'string', 'number'],
                         [code, conf, keys, data, 3]);
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
        console.log(text)
    },
    printErr: text => {
        if (arguments.length > 1)
            text = Array.prototype.slice.call(arguments).join(' ')
        console.error(text)
        return
    },
    exec_ok: () => {},
    exec_error: () => {},
}
