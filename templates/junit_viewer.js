function addClass(element, className) {
    if (element)
        element.className = element.className + ' ' + className
}

function removeClass(element, className) {
    if (element)
        element.className = element.className.replace(' ' + className, '')
}

function replaceClass(element, fromClassName, toClassName) {
    if (element)
        element.className = element.className.replace(fromClassName, toClassName)
}

function toggleContraction(element) {
    var suiteButton = element.children[0]
    var suiteContent = element.children[1]
    var isContracted = suiteContent.className.indexOf('contracted') !== -1

    if (isContracted) {
        replaceClass(suiteButton, 'round', 'flat')
        removeClass(suiteContent, 'contracted')
    } else {
        replaceClass(suiteButton, 'flat', 'round')
        addClass(suiteContent, 'contracted')
    }
}

function createHiddenInfo(suites) {
    var data = {}
    Object.keys(suites).forEach(function(key, index) {
        var junitInfo = document.getElementById(key)
        if (junitInfo && junitInfo.className.indexOf('not_in_search') === -1 && junitInfo.className.indexOf('hidden') === -1) {
            var type = junitInfo.children[0].className.split(' ')[0].split('--')[1]
            if (!data.hasOwnProperty(type))
                data[type] = 0
            data[type] += 1
        }
    })
    return data
}

function updateInfo() {
    var suites = document.getElementsByClassName('suite')
    var hiddenSuites = document.getElementsByClassName('suite hidden')
    var noInSearchSuites = document.getElementsByClassName('suite not_in_search')

    document.getElementById('junit_info_suite_count_count').innerHTML = suites.length - hiddenSuites.length - noInSearchSuites.length

    var data = createHiddenInfo(suites)

    Object.keys(junit_info.suites).filter(function(key) {
        return key !== 'count'
    }).forEach(function(key) {
        if (data.hasOwnProperty(key))
            document.getElementById('junit_info_suite_' + key + '_count').innerHTML = data[key]
        else
            document.getElementById('junit_info_suite_' + key + '_count').innerHTML = 0
    })


    // var hiddenTests = document.getElementsByClassName('test hidden')

    // document.getElementById('junit_info_suite_count_count')
    // document.getElementById('junit_info_suite_passed_count')
    // document.getElementById('junit_info_suite_failre_count')

    // document.getElementById('junit_info_test_count_count')
    // document.getElementById('junit_info_test_passed_count')
    // document.getElementById('junit_info_test_failre_count')
    // document.getElementById('junit_info_test_error_count')
    // document.getElementById('junit_info_test_skipped_count')

}

// SUITES

function contractSuites(button) {
    var isContracted = button.innerHTML.indexOf('EXPAND') !== -1
    button.innerHTML = isContracted ? 'CONTRACT ALL' : 'EXPAND ALL'

    suites.forEach(function(suite) {
        var suiteElement = document.getElementById(suite.id)
        var suiteButton = suiteElement.children[0]
        var suiteContent = suiteElement.children[1]

        if (isContracted) {
            replaceClass(suiteButton, 'round', 'flat')
            removeClass(suiteContent, 'contracted')
        } else {
            replaceClass(suiteButton, 'flat', 'round')
            addClass(suiteContent, 'contracted')
        }
    })
}

function hidePassingSuites(button) {
    var isHidden = button.innerHTML.indexOf('SHOW') !== -1
    button.innerHTML = isHidden ? 'HIDE PASSING' : 'SHOW PASSING'

    suites.forEach(function(suite) {
        var suiteElement = document.getElementById(suite.id)
        if (isHidden)
            removeClass(suiteElement, 'hidden')
        else if (suite.type === 'passed')
            addClass(suiteElement, 'hidden')
    })

    updateInfo()
}

function globToRegex(pat) {
    var i = 0,
        j, n = pat.length || 0,
        res, c, stuff
    res = '^';
    while (i < n) {
        c = pat[i];
        i = i + 1;
        if (c === '*') {
            res = res + '.*';
        } else if (c === '?') {
            res = res + '.';
        } else if (c === '[') {
            j = i;
            if (j < n && pat[j] === '!') {
                j = j + 1;
            }
            if (j < n && pat[j] === ']') {
                j = j + 1;
            }
            while (j < n && pat[j] !== ']') {
                j = j + 1;
            }
            if (j >= n) {
                res = res + '\\[';
            } else {
                stuff = pat.slice(i, j).replace('\\', '\\\\');
                i = j + 1;
                if (stuff[0] === '!') {
                    stuff = '^' + stuff.slice(1);
                } else if (stuff[0] === '^') {
                    stuff = '\\' + stuff;
                }
                res = res + '[' + stuff + ']';
            }
        } else {
            res = res + escape(c);
        }
    }
    return res + '$';
}

function match(search, text) {
    text = text.toUpperCase()
    search = search.toUpperCase()

    if (text.indexOf(search) !== -1) return true

    try {
        if (text.match(new RegExp(search)) !== null) return true
    } catch (e) {}

    try {
        if (text.match(new RegExp(globToRegex(search))) !== null) return true
    } catch (e) {}

    var j = -1
    for (var i = 0; i < search.length; i++) {
        var l = search[i]
        if (l == ' ') continue
        j = text.indexOf(l, j + 1)
        if (j == -1) return false
    }
    return true
}

function searchSuites(value) {
    value = value.toUpperCase()
    suites.forEach(function(suite) {
        var suiteElement = document.getElementById(suite.id)
        if (value === '') {
            removeClass(suiteElement, 'not_in_search')
            return
        }

        // var inSearch = suite.name.toUpperCase().indexOf(value) !== -1
        var inSearch = match(value, suite.name)
        var notAlreadySearched = suiteElement.className.indexOf('not_in_search') === -1
        if (!inSearch && notAlreadySearched)
            addClass(suiteElement, 'not_in_search')
        if (inSearch)
            removeClass(suiteElement, 'not_in_search')
    })

    updateInfo()
}

// TESTS

function forEachTest(callback) {
    suites.forEach(function(suite) {
        suite.testCases.forEach(callback)
    })
}

function contractTests(button) {
    var isContracted = button.innerHTML.indexOf('EXPAND') !== -1
    button.innerHTML = isContracted ? 'CONTRACT ALL' : 'EXPAND ALL'
    forEachTest(function(test) {
        var testElement = document.getElementById(test.id)
        var testButton = testElement.children[0]
        var testContent = testElement.children[1]

        if (isContracted) {
            replaceClass(testButton, 'round', 'flat')
            removeClass(testContent, 'contracted')
        } else {
            replaceClass(testButton, 'flat', 'round')
            addClass(testContent, 'contracted')
        }
    })
}

function hideTests(button) {
    var isHidden = button.innerHTML.indexOf('SHOW') !== -1
    button.innerHTML = isHidden ? 'HIDE ALL' : 'SHOW ALL'
    forEachTest(function(test) {
        var testElement = document.getElementById(test.id)
        if (isHidden)
            removeClass(testElement, 'hidden')
        else
            addClass(testElement, 'hidden')
    })

    updateInfo()
}

function hidePassingTests(button) {
    var isHidden = button.innerHTML.indexOf('SHOW') !== -1
    button.innerHTML = isHidden ? 'HIDE ALL' : 'SHOW ALL'
    forEachTest(function(test) {
        var testElement = document.getElementById(test.id)
        if (isHidden)
            removeClass(testElement, 'hidden')
        else if (test.type === 'passed')
            addClass(testElement, 'hidden')
    })

    updateInfo()
}

function searchTests(value) {
    value = value.toUpperCase()
    forEachTest(function(test) {
        var testElement = document.getElementById(test.id)
        if (value === '') {
            removeClass(testElement, 'not_in_search')
            return
        }

        // var inSearch = test.name.toUpperCase().indexOf(value) !== -1
        var inSearch = match(value, test.name)
        test.messages.values.forEach(function(message) {
            // var isInMessage = message.value.toUpperCase().indexOf(value) !== -1
            var isInMessage = match(value, message.value)
            if (isInMessage)
                inSearch = true
        })

        var notAlreadySearched = testElement.className.indexOf('not_in_search') === -1
        if (!inSearch && notAlreadySearched)
            addClass(testElement, 'not_in_search')
        if (inSearch)
            removeClass(testElement, 'not_in_search')
    })

    updateInfo()
}

// Properties

function contractProperties(button) {
    var isContracted = button.innerHTML.indexOf('EXPAND') !== -1
    button.innerHTML = isContracted ? 'CONTRACT ALL' : 'EXPAND ALL'

    suites
        .filter(function(suite) {
            return suite.properties.values.length > 0
        })
        .forEach(function(suite) {
            var propertiesElement = document.getElementById(suite.properties.id)
            var propertiesButton = propertiesElement.children[0]
            var propertiesContent = propertiesElement.children[1]

            if (isContracted) {
                replaceClass(propertiesButton, 'round', 'flat')
                removeClass(propertiesContent, 'contracted')
            } else {
                replaceClass(propertiesButton, 'flat', 'round')
                addClass(propertiesContent, 'contracted')
            }
        })
}

function hideProperties(button) {
    var isHidden = button.innerHTML.indexOf('SHOW') !== -1
    button.innerHTML = isHidden ? 'HIDE ALL' : 'SHOW ALL'
    suites
        .filter(function(suite) {
            return suite.properties.values.length > 0
        })
        .forEach(function(suite) {
            var propertiesElement = document.getElementById(suite.properties.id)
            if (isHidden)
                removeClass(propertiesElement, 'hidden')
            else
                addClass(propertiesElement, 'hidden')
        })
}

function searchProperties(value) {
    value = value.toUpperCase()
    suites.forEach(function(suite) {
        suite.properties.values.forEach(function(property) {
            var propertyElement = document.getElementById(property.id)
            if (value === '') {
                removeClass(propertyElement, 'not_in_search')
                return
            }

            // var inSearch = property.name.toUpperCase().indexOf(value) !== -1 ||
            //     property.value.toUpperCase().indexOf(value) !== -1

            var inSearch = match(value, property.name) || match(value, property.value)
            var notAlreadySearched = propertyElement.className.indexOf('not_in_search') === -1
            if (!inSearch && notAlreadySearched)
                addClass(propertyElement, 'not_in_search')
            if (inSearch)
                removeClass(propertyElement, 'not_in_search')

        })
    })
}

function showOptions() {
    var collapsed = document.getElementById('optionsCollapsed')
    collapsed.style.display = "none"

    var expanded = document.getElementById('optionsExpanded')
    expanded.style.display = "block"

    var optionsContainer = document.getElementById('options_container')
    optionsContainer.className = optionsContainer.className.replace('one', 'one-third')

    var suitesContainer = document.getElementById('suites_container')
    suitesContainer.className = suitesContainer.className.replace('eleven ', 'two-thirds ')
    suitesContainer.className = suitesContainer.className.replace('columns ', 'column ')
}

function hideOptions() {
    var collapsed = document.getElementById('optionsCollapsed')
    collapsed.style.display = "block"

    var expanded = document.getElementById('optionsExpanded')
    expanded.style.display = "none"

    var optionsContainer = document.getElementById('options_container')
    optionsContainer.className = optionsContainer.className.replace('one-third', 'one')

    var suitesContainer = document.getElementById('suites_container')
    suitesContainer.className = suitesContainer.className.replace('two-thirds ', 'eleven ')
    suitesContainer.className = suitesContainer.className.replace('column ', 'columns ')
}

var height = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight
document.getElementById('suites_container').style['height'] = height + 'px'
document.getElementById('options').style['height'] = (height - 38 * 2) + 'px'

window.onresize = function(event) {
    var height = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight
    document.getElementById('suites_container').style['height'] = height + 'px'
    document.getElementById('options').style['height'] = (height - 38 * 2) + 'px'
}
