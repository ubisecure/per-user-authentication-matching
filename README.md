# Per User Authentication Matching for Ubisecure SSO

Per User Authentication Matching is a javascript based frontend user interface (UI) extension to Ubisecure SSO. It updates the flow of entering credentials by hiding irrelevant authentication methods based on method specific regular expression rules.

Compatible with SSO 8.3.0 and later.

## Installation

Copy the script _per-user-authentication-matching.js_ to your Ubisecure SSO installation to folder *ubilogin/custom/resources/script/*.

Define the script in the resource index (*ubilogin/custom/resource.index*) by adding the following line.
```
script/per-user-authentication-matching.js = resources/script/per-user-authentication-matching.js
```
For the following section we'll use the template named *default* to install the UI extension. However, nothing prevents using any other template instead.

Check from the template index (*ubilogin/custom/template.index*) which template properties file corresponds to the *default* template. You should be able to locate the line in which the key `default` is defined. The value is the relative location of the template properties file.

If `default` is not set in the template index, then you'll need to add it.
```
default = templates/default.properties
```
The corresponding template properties file in this case would be *ubilogin/custom/templates/default.properties*.

Finally, include the script *per-user-authentication-matching.js* in the `javascript` property in the template properties as shown below.
```
javascript = /resource/script/per-user-authentication-matching.js
```

## Configuration

Per User Authentication Matching supports a number of configuration parameters, which are defined as properties in a javascript object named `perUserAuthenticationMatchingParams`. The object  can either be inserted on top of the *per-user-authentication-matching.js*, or alternatively in a separate javascript file (see ***Using separate configuration file*** below).


##### Example of the configuration object `perUserAuthenticationMatchingParams`:
```javascript
const perUserAuthenticationMatchingParams = {
  enabled: true,
  autoRedirect: true,
  validByDefault: true,
  validationRules: {
    "password.1": /^[^@]+$/g  // doesn't contain @
  },
  errorMessages: {
    "INVALID_USERNAME": {
      ""  : "Invalid username",
      "fi": "Virheellinen käyttäjätunnus",
      "sv": "Ogiltigt användarnamn"
    }
  }
}
```

### Supported configuration parameters:

#### enabled

Convenient way to quickly enable or disable the UI customization.

- `true` The UI customization is enabled.
- `false` The UI customization is disabled.

##### Default: 
`true`

##### Example:
```javascript
  enabled: false
```

#### autoRedirect

Enable or disable automatic redirection when there is only one valid external authentication method and no valid password authentication methods for an entered username.

- `false` User needs to explicitly select a valid external method in all cases.
- `true` User is redirected automatically to the single external authentication method.

##### Default: 
`false`

##### Example:
```javascript
  autoRedirect: true
```

#### validByDefault

Set the default behavior for username validation for authentication methods, which don't have a key set with any values in the `validationRules` map. 

- `true` All usernames are *valid* for methods that don't have a key set in the `validationRules` map.
- `false` All usernames are *invalid* for methods that don't have a key set in the `validationRules` map.

##### Default: 
`true`

##### Example:
```javascript
  validByDefault: false
```

#### errorMessages

Locale specific error messages for the supported error message keys.

A default error message for an error message key, which is shown for all unspecified locales, can be defined using an empty locale (`""`).

Supported error message keys:
- `INVALID_USERNAME` Invalid username is entered.

##### Default: 
`{}`

##### Example:
```javascript
  errorMessages: {
    "INVALID_USERNAME": {
      ""  : "Invalid username",
      "fi": "Virheellinen käyttäjätunnus",
      "sv": "Ogiltigt användarnamn"
    }
  }

```

#### validationRules
Regular expressions used as rules for validating usernames entered by users in the login page. The username is considered to be valid if any of the regular expressions in the array match with the username. The rules are defined per authentication method.

##### Default: 
`{}`

##### Example:
```javascript
  validationRules: {
    "password.1":        /^[^@]+$/g ,                   // doesn't contain @
    "password.acme.1":   /@acme.com$/g ,                // ends in @acme.com
    "saml.foobar.1":   [ /@foo.com$/g,                  // ends in @foo.com
                         /@bar.com$/g ],                //      or @bar.com
    "oidc.baz.1":      [ /@baz.com$/g ]                 // ends in @baz.com
  }
```
Note that if there's only one regular expression rule for a method, the rule can be set directly as the value -  i.e. it doesn't need to be wrapped in an array.

If there are no rules set for a certain method, then all usernames will evaluate as valid for that method. 

If validationRules is undefined or null, then all usernames will evaluate as valid for all methods.

### Using separate configuration file

Using a separate configuration file has the advantage that the same base script *per-user-authentication-matching.js* can be used unmodified in several templates, each with the different configurations put in template specific configuration files.

##### Example *per-user-authentication-matching-config-default.js*:
```javascript
const perUserAuthenticationMatchingParams = {
  enabled: true,
  autoRedirect: true,
  validByDefault: true,
  validationRules: {
    "password.1": /^[^@]+$/g  // doesn't contain @
  },
  errorMessages: {
    "INVALID_USERNAME": {
      ""  : "Invalid username",
      "fi": "Virheellinen käyttäjätunnus",
      "sv": "Ogiltigt användarnamn"
    }
  }
}
```

Just as with *per-user-authentication-matching.js*, the configuration file(s) need to be defined in the resource index
```
script/per-user-authentication-matching-config-default.js = resources/script/per-user-authentication-matching-config-default.js
```
and also in the template properties.
```
javascript = /resource/script/per-user-authentication-matching-config-default.js, /resource/script/per-user-authentication-matching.js
```
Note that the configuration file needs to be located before the *per-user-authentication-matching.js* so that the configurations get loaded before the implementation.

## License
[MIT](https://choosealicense.com/licenses/mit/)
