;(function(window){
    var _PLUSNAME = 'Contacts';
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;

    var phoneAddressBook;
    var simAddressBook;

    var ContactError = function(err) {
        this.code = (typeof err != 'undefined' ? err : null);
    };

    ContactError.UNKNOWN_ERROR = 0;
    ContactError.INVALID_ARGUMENT_ERROR = 1;
    ContactError.TIMEOUT_ERROR = 2;
    ContactError.PENDING_OPERATION_ERROR = 3;
    ContactError.IO_ERROR = 4;
    ContactError.NOT_SUPPORTED_ERROR = 5;
    ContactError.PERMISSION_DENIED_ERROR = 20;

    function ContactField (type, value, pref) {
        this.id = null;
        this.type = (type && type.toString()) || null;
        this.value = (value && value.toString()) || null;
        this.preferred = (typeof pref != 'undefined' ? pref : false);
    };

    function Contact(id, displayName, name, nickname, phoneNumbers, emails, addresses,
        ims, organizations, birthday, note, photos, categories, urls) {
        //for native
        this.id = id || null;
        this.target = 0;
        //js pro
        this.displayName = displayName || null;
        this.name = name || null; // ContactName
        this.nickname = nickname || null;
        this.phoneNumbers = phoneNumbers || null; // ContactField[]
        this.emails = emails || null; // ContactField[]
        this.addresses = addresses || null; // ContactAddress[]
        this.ims = ims || null; // ContactField[]
        this.organizations = organizations || null; // ContactOrganization[]
        this.birthday = birthday || null;
        this.note = note || null;
        this.photos = photos || null; // ContactField[]
        this.categories = categories || null; // ContactField[]
        this.urls = urls || null; // ContactField[]
    };

    Contact.prototype.remove = function(successCB, errorCB) {
        var fail = errorCB && function(code) {
            errorCB(new ContactError(code));
        };
        if (this.id === null) {
            fail(ContactError.UNKNOWN_ERROR);
        }
        else {
            var callbackid = bridge.callbackId( successCB, fail );
            bridge.exec( _PLUSNAME, 'remove', [ callbackid, this.id, this.target] );
        }
    };

    Contact.prototype.clone = function() {
        var clonedContact = tools.clone(this);
        clonedContact.id = null;

        function nullIds(arr) {
            if (arr) {
                for (var i = 0; i < arr.length; ++i) {
                    arr[i].id = null;
                }
            }
        }
        // Loop through and clear out any id's in phones, emails, etc.
        nullIds(clonedContact.phoneNumbers);
        nullIds(clonedContact.emails);
        nullIds(clonedContact.addresses);
        nullIds(clonedContact.ims);
        nullIds(clonedContact.organizations);
        nullIds(clonedContact.categories);
        nullIds(clonedContact.photos);
        nullIds(clonedContact.urls);
        return clonedContact;
    };

    function convertCopy (contact, tContact) {
        tContact.id = contact.id;

        function copyIds(arr, tarr) {
            if (arr) {
                for (var i = 0; i < arr.length; ++i) {
                    tarr[i].id = arr[i].id;
                }
            }
        }
        // Loop through and clear out any id's in phones, emails, etc.
        copyIds(contact.phoneNumbers, tContact.phoneNumbers);
        copyIds(contact.emails, tContact.emails);
        copyIds(contact.addresses, tContact.addresses);
        copyIds(contact.ims, tContact.ims);
        copyIds(contact.organizations, tContact.organizations);
        copyIds(contact.categories, tContact.categories);
        copyIds(contact.photos, tContact.photos);
        copyIds(contact.urls, tContact.urls);
    }

    function convertIn(contact) {
        var value = contact.birthday;
        try {
            if ( !tools.isDate(value) ) {
                contact.birthday = new Date(parseFloat(value));
            }
        } catch (exception){
            console.log("Cordova Contact convertIn error: exception creating date.");
        }
        return contact;
    }

    function convertOut(contact) {
        var value = contact.birthday;
        if (value !== null) {
            // try to make it a Date object if it is not already
            if (!tools.isDate(value)){
                try {
                    value = new Date(value);
                } catch(exception){
                    value = null;
                }
            }
            if (tools.isDate(value)){
                value = value.valueOf(); // convert to milliseconds
            }
            contact.birthday = value;
        }
        return contact;
    }

    Contact.prototype.save = function(successCB, errorCB) {
        var me = this;
        var fail = function(code) {
            errorCB(new ContactError(code));
        };
        var success = function(result) {
            if (result) {
                try{
                var fullContact = me.target == 0 ? phoneAddressBook.create(result) : simAddressBook.create(result);
                if (successCB) {
                    convertCopy(convertIn(fullContact), me);
                    successCB(/*convertIn(fullContact)*/me);
                }
            } catch(e) { console.log(e) }
            } else {
                // no Entry object returned
                fail(ContactError.UNKNOWN_ERROR);
            }
        };
        var dupContact = convertOut(tools.clone(this));
        var callbackid = bridge.callbackId( success, fail );
        bridge.exec( _PLUSNAME, 'save', [ callbackid, dupContact, this.target] );
    };

    function AddressBook ( type ) {
        this.type = type;
     }

    AddressBook.prototype.create = function (properties) {
        var contact = new Contact();
        contact.target = this.type;
        for ( var i in properties ) {
            if (typeof contact[i] !== 'undefined' && properties.hasOwnProperty(i)) {
                contact[i] = properties[i];
            }
        }
        return contact;
    };

    AddressBook.prototype.find = function( fields, successCB, errorCB, options  ) {
        if (!fields.length) {
            errorCB && errorCB(new ContactError(ContactError.INVALID_ARGUMENT_ERROR));
        } else {
            var win = function(result) {
                var cs = [];
                for (var i = 0, l = result.length; i < l; i++) {
                    cs.push(phoneAddressBook.create(result[i]));
                }
                successCB(cs);
            };
            var callbackid = bridge.callbackId( win, errorCB );
            bridge.exec(_PLUSNAME, "search", [callbackid, fields, options]);
        }
    };

    var contacts = {
        getAddressBook : function ( type, successCB, errorCB ) {
            if ( type !== 0 || type !== 1 ) { 
                type = 0;
            };
            var success = function(result) {
                if ( successCB ) {
                    if ( contacts.ADDRESSBOOK_PHONE == type ) {
                        phoneAddressBook = phoneAddressBook ? phoneAddressBook : new AddressBook(0);
                        successCB(phoneAddressBook);
                    } else {
                        simAddressBook = simAddressBook ? simAddressBook : new AddressBook(1);
                        successCB(phoneAddressBook);
                    }
                }
            };
            var error = function(eCode) {
                errorCB(new ContactError(eCode));
            };
            var callbackid = bridge.callbackId( success, error );
            bridge.exec( _PLUSNAME, 'getAddressBook', [ callbackid, type] );
        },
        ADDRESSBOOK_PHONE : 0,
        ADDRESSBOOK_SIM : 1
    };

    window.plus.contacts = navigator.plus.contacts = contacts;
})(window);

