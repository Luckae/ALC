(function () {
    'use strict';
    const str =
    "ALL|XCD|EUR|BBD|BTN|BND|XAF|CUP|USD|FKP|GIP|HUF|IRR|JMD|AUD|LAK|LYD|MKD|XOF|NZD|OMR|PGK|RWF|WST|RSD|SEK|TZS|AMD|BSD|BAM|CVE|CNY|CRC|CZK|ERN|GEL|HTG|INR|JOD|KRW|LBP|MWK|MRO|MZN|ANG|PEN|QAR|STD|SLL|SOS|SDG|SYP|AOA|AWG|BHD|BZD|BWP|BIF|KYD|COP|DKK|GTQ|HNL|IDR|ILS|KZT|KWD|LSL|MYR|MUR|MNT|MMK|NGN|PAB|PHP|RON|SAR|SGD|ZAR|SRD|TWD|TOP|VEF|DZD|ARS|AZN|BYR|BOB|BGN|CAD|CLP|CDF|DOP|FJD|GMD|GYD|ISK|IQD|JPY|KPW|LVL|CHF|MGA|MDL|MAD|NPR|NIO|PKR|PYG|SHP|SCR|SBD|LKR|THB|TRY|AED|VUV|YER|AFN|BDT|BRL|KHR|KMF|HRK|DJF|EGP|ETB|XPF|GHS|GNF|HKD|XDR|KES|KGS|LRD|MOP|MVR|MXN|NAD|NOK|NGN|PLN|RUB|SZL|TJS|TTD|UGX|UYU|VND|TND|UAH|UZS|TMT|GBP|ZMW|BTC|BYN",
  countries = str.split("|");

    function _(x) {
        return document.getElementById(x);
    }
    let converter_btn = _('convert');
    converter_btn.addEventListener('click', convertCurrency, false);

    function generateOptions() {
        let option1 = `<option value="USD">USD</option>`,
            option2 = `<option value="NGN">NGN</option>`,
            OptionFrom = _('from'),
            optionTo = _('to');
        for (let country of countries) {
            option1 += `<option value="${country}">${country}</option>`;
            option2 += `<option value="${country}">${country}</option>`;
        }
        OptionFrom.innerHTML = option1;
        optionTo.innerHTML = option2;
    }
    generateOptions();
    localforage.config({
        driver: localforage.INDEXEDDB,
        name: 'Lawson Luke DB',
        storeName: 'Currency Converter',
        description: 'This stores program state and enable offline conversions'
    });

    function convertCurrency() {
        let input = _('number'),
            OptionFrom = _('from'),
            optionTo = _('to'),
            input_value = input.value,
            from_value = OptionFrom.value,
            to_value = optionTo.value;
        if (!input_value || !from_value || !to_value) {
           alert(
                'No conversion value specified'
           );
            //document.write('<div class="alert alert-danger alert-dismissable fade in"><a  class="close" data-dismiss="alert" aria-label="close" href="#">&times;</a><strong><h3>Conversion rate cannot be empty</h3></div>');
            return;
        }
        if (isNaN(input_value)) {
            alert('input is not a number. Please enter a valid input');
            return;
        }
        let query = `${from_value}_${to_value}`,
            url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;
        fetch(url)
            .then((response) => {
                return response.json();
            }).then((json) => {
                renderCurency(json);
                insertToIndexedDb(url, json);
            }).catch((ex) => {
                localforage.getItem(url).then((value) => {
                    if (value != null) {
                        renderCurency(value);
                    }
                    console.log(value);
                }).catch(function (err) {
                    console.log(err);
                });
            });

    }

    function insertToIndexedDb(url, data) {
        localforage.setItem(url, data).then((value) => {
            console.log(`Result inserted into storage ${value}`);
        }).catch((err) => {
            console.log(err);
        });
    }
    function renderCurency(data) {
        let output, currency, curr,
            rx = /[^0-9.]/g,
            answer = _('answer'),
            optionTo = _('to'),
            input = _('number'),
            input_value = input.value,
            to_value = optionTo.value;
        curr = JSON.stringify(data).split(":")[1];
        currency = curr.replace(rx, '');
        output = (parseInt(input_value) * currency);
        answer.innerHTML = `${to_value}:  ${output}`;
    }
})();
