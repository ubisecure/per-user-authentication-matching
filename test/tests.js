/**
 * MIT License
 *
 * Copyright (c) 2019 Ubisecure, Inc
 *
 * Permission is hereby granted, free  of charge, to any person obtaining
 * a  copy  of this  software  and  associated  documentation files  (the
 * "Software"), to  deal in  the Software without  restriction, including
 * without limitation  the rights to  use, copy, modify,  merge, publish,
 * distribute,  sublicense, and/or sell  copies of  the Software,  and to
 * permit persons to whom the Software  is furnished to do so, subject to
 * the following conditions:
 *
 * The  above  copyright  notice  and  this permission  notice  shall  be
 * included in all copies or substantial portions of the Software.
 *
 * THE  SOFTWARE IS  PROVIDED  "AS  IS", WITHOUT  WARRANTY  OF ANY  KIND,
 * EXPRESS OR  IMPLIED, INCLUDING  BUT NOT LIMITED  TO THE  WARRANTIES OF
 * MERCHANTABILITY,    FITNESS    FOR    A   PARTICULAR    PURPOSE    AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE,  ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
 
var testValidationRules = {
    "password.1": [ /^\*$/g , /password\.1/g ],
    "password.2": [ /^\*$/g , /password\.2/g ],
    "external.1": [ /^\*$/g , /external\.1/g ],
    "external.2": [ /^\*$/g , /external\.2/g ]
}

var $ = function() {};


QUnit.test( "Login - initial state", function( assert ) {
    var passwordMethods = ["password.1", "password.2"];
    var externalMethods = ["external.1", "external.2"];
    var login = new Login(passwordMethods, externalMethods, testValidationRules, true);
    assert.equal( login.getUsername(), "", "username is empty" );
    assert.deepEqual( login.getValidPasswordMethods(), [], "no valid password methods" );
    assert.deepEqual( login.getValidExternalMethods(), [], "no valid external methods" );
    assert.equal( login.getSelectedPasswordMethod(), "", "no selected password method" );
    assert.notOk( login.isUsernameValid(), "username is not valid" );
});

QUnit.test( "Login - set empty username", function( assert ) {
    var passwordMethods = ["password.1", "password.2"];
    var externalMethods = ["external.1", "external.2"];
    var login = new Login(passwordMethods, externalMethods, testValidationRules, true);
    login.setUsername("  ");
    assert.equal( login.getUsername(), "", "username is empty" );
    assert.deepEqual( login.getValidPasswordMethods(), [], "no valid password methods" );
    assert.deepEqual( login.getValidExternalMethods(), [], "no valid external methods" );
    assert.equal( login.getSelectedPasswordMethod(), "", "no selected password method" );
    assert.notOk( login.isUsernameValid(), "username is not valid" );
});

QUnit.test( "Login - set valid username with one valid password method and one valid external method", function( assert ) {
    var passwordMethods = ["password.1", "password.2"];
    var externalMethods = ["external.1", "external.2"];
    var login = new Login( passwordMethods, externalMethods, testValidationRules, true);
    login.setUsername("password.1 external.1");
    assert.equal( login.getUsername(), "password.1 external.1", "username is ok" );
    assert.deepEqual( login.getValidPasswordMethods(), ["password.1"], "valid password methods ok" );
    assert.deepEqual( login.getValidExternalMethods(), ["external.1"], "valid external methods ok" );
    assert.equal( login.getSelectedPasswordMethod(), "password.1", "selected password method ok" );
    assert.ok( login.isUsernameValid(), "username is valid" );
});


QUnit.test( "Login - set valid username with two valid password methods and two valid external methods", function( assert ) {
    var passwordMethods = ["password.1", "password.2"];
    var externalMethods = ["external.1", "external.2"];
    var login = new Login(passwordMethods, externalMethods, testValidationRules, true);
    login.setUsername("*");
    assert.equal( login.getUsername(), "*", "username is ok" );
    assert.deepEqual( login.getValidPasswordMethods(), ["password.1", "password.2"], "valid password methods ok" );
    assert.deepEqual( login.getValidExternalMethods(), ["external.1", "external.2"], "valid external methods ok" );
    assert.equal( login.getSelectedPasswordMethod(), "", "no selected password method" );
    assert.ok( login.isUsernameValid(), "username is valid" );
});

QUnit.test( "Login - set valid username with two valid password methods and two valid external methods and select password.1", function( assert ) {
    var passwordMethods = ["password.1", "password.2"];
    var externalMethods = ["external.1", "external.2"];
    var login = new Login(passwordMethods, externalMethods, testValidationRules, true);
    login.setUsername("*");
    login.setSelectedPasswordMethod("password.1");
    assert.equal( login.getUsername(), "*", "username is ok" );
    assert.deepEqual( login.getValidPasswordMethods(), ["password.1", "password.2"], "valid password methods ok" );
    assert.deepEqual( login.getValidExternalMethods(), ["external.1", "external.2"], "valid external methods ok" );
    assert.equal( login.getSelectedPasswordMethod(), "password.1", "selected password method is ok" );
    assert.ok( login.isUsernameValid(), "username is valid" );
});

QUnit.test( "Login - set valid username with two valid password methods and two valid external methods and select invalid password method", function( assert ) {
    var passwordMethods = ["password.1", "password.2"];
    var externalMethods = ["external.1", "external.2"];
    var login = new Login(passwordMethods, externalMethods, testValidationRules, true);
    login.setUsername("*");
    login.setSelectedPasswordMethod("password.invalid");
    assert.equal( login.getUsername(), "*", "username is ok" );
    assert.deepEqual( login.getValidPasswordMethods(), ["password.1", "password.2"], "valid password methods ok" );
    assert.deepEqual( login.getValidExternalMethods(), ["external.1", "external.2"], "valid external methods ok" );
    assert.equal( login.getSelectedPasswordMethod(), "", "selected password method is ok" );
    assert.ok( login.isUsernameValid(), "username is valid" );
});

QUnit.test( "Login - set valid username with two valid password methods and two valid external methods, select password.1 and set another username", function( assert ) {
    var passwordMethods = ["password.1", "password.2"];
    var externalMethods = ["external.1", "external.2"];
    var login = new Login(passwordMethods, externalMethods, testValidationRules, true);
    login.setUsername("*");
    login.setSelectedPasswordMethod("password.1");
    login.setUsername("password.2");
    assert.equal( login.getUsername(), "password.2", "username is ok" );
    assert.deepEqual( login.getValidPasswordMethods(), ["password.2"], "valid password methods ok" );
    assert.deepEqual( login.getValidExternalMethods(), [], "valid external methods ok" );
    assert.equal( login.getSelectedPasswordMethod(), "password.2", "selected password method ok" );
    assert.ok( login.isUsernameValid(), "username is valid" );
});

QUnit.test( "Login - no validationRules", function( assert ) {
    var passwordMethods = ["password.1", "password.2"];
    var externalMethods = ["external.1", "external.2"];
    var login = new Login(passwordMethods, externalMethods, null, true);
    login.setUsername("test");
    assert.equal( login.getUsername(), "test", "username is ok" );
    assert.deepEqual( login.getValidPasswordMethods(), ["password.1", "password.2"], "valid password methods ok" );
    assert.deepEqual( login.getValidExternalMethods(), ["external.1", "external.2"], "valid external methods ok" );
    assert.equal( login.getSelectedPasswordMethod(), "", "selected password method ok" );
    assert.ok( login.isUsernameValid(), "username is valid" );
});


QUnit.test( "Login - set null or undefined username", function( assert ) {
    var passwordMethods = ["password.1", "password.2"];
    var externalMethods = ["external.1", "external.2"];
    var login = new Login(passwordMethods, externalMethods, null);
    assert.throws(
        function() {
            login.setUsername(null)
        }, 
        new Error("argument username must be string"), 
        "raised error for null username"
    );
    
    assert.throws(
        function() {
            login.setUsername(undefined)
        }, 
        new Error("argument username must be string"), 
        "raised error for undefined username"
    );
});
