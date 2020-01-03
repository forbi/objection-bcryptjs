# Automatic Bcryptjs Password Hashing for Objection.js

This plugin automatically adds automatic password hashing to your [Objection.js](https://github.com/Vincit/objection.js/) models. This makes it super-easy to secure passwords and other sensitive data.

Under the hood, the plugin uses [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js/) for hashing.

## Installation

`yarn add objection-bcryptjs`

## Usage

### Hashing your data

```js
import ObjectionBcrypt from "objection-bcryptjs";
import Model from "objection";

const Password = ObjectionBcrypt({
  passwordField: "password", //default
  rounds: 10 //default 
});

class Person extends Password(Model) {
  // ...
}

const person = await Person.query().insert({
  email: "matt@damon.com",
  password: "q1w2e3r4"
});

console.log(person.password);
// $2y$10$vFD.0TU8IpA9xLdgAQFZeeGy8h0xvJ8to3fX0l9dJn2BWGMWN5zh6
```

### Verifying the data

```js
// the password to verify
const password = "q1w2e3r4";

// fetch the person by email
const person = await Person.query()
  .findOne({ email: "matt@damon.com" });

// verify the password is correct
const passwordValid = await person.verifyPassword(password);

```

## Options

There are a few options you can pass to customize the way the plugin works.

These options can be added when instantiating the plugin.


#### `allowEmptyPassword` (defaults to `false`)

Allows an empty password to be set.

#### `passwordField` (defaults to `password`)

Allows you to override the name of the field to be hashed.

#### `rounds` (defaults to `10`)

Set the number of rounds for bcrypt.
