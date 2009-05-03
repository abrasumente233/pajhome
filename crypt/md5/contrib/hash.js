/*
 * A JavaScript implementation of:
 * - the RSA Data Security, Inc. MD4 Message Digest Algorithm, as defined in RFC 1320
 * - the RSA Data Security, Inc. MD5 Message Digest Algorithm, as defined in RFC 1321
 * - Secure Hash Algorithm, SHA-1, as defined in FIPS PUB 180-1
 * Algorythms: Version 2.1 Copyright (C) Jerrad Pierce, Paul Johnston 1999 - 2002.
 * Javascript class: Version 1.0 Copyright (C) Fernando Lordán, August 2006.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/**
 * @param string String to hash.
 * @param string Hash method. Can be either "md4", "md5" or "sha1". Optional. Default is "md5".
 * @param string Output encoding. Can be either "hex", "b64" or "str". Optional. Default is "hex".
 */
function hash (stringToHash, hashMethod, outputEncoding) {
	/*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	this.hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
	this.b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
	this.chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

	/*
	 * These are the functions you'll usually want to call
	 */
	this._hex_md4 = function (s){ return this._binl2hex(this._core_md4(this._str2binl(s), s.length * this.chrsz));}
	this._b64_md4 = function (s){ return this._binl2b64(this._core_md4(this._str2binl(s), s.length * this.chrsz));}
	this._str_md4 = function (s){ return this._binl2str(this._core_md4(this._str2binl(s), s.length * this.chrsz));}
	this._hex_hmac_md4 = function (key, data) { return this._binl2hex(this._core_hmac_md4(key, data)); }
	this._b64_hmac_md4 = function (key, data) { return this._binl2b64(this._core_hmac_md4(key, data)); }
	this._str_hmac_md4 = function (key, data) { return this._binl2str(this._core_hmac_md4(key, data)); }

	this._hex_md5 = function (s){ return this._binl2hex(this._core_md5(this._str2binl(s), s.length * this.chrsz));}
	this._b64_md5 = function (s){ return this._binl2b64(this._core_md5(this._str2binl(s), s.length * this.chrsz));}
	this._str_md5 = function (s){ return this._binl2str(this._core_md5(this._str2binl(s), s.length * this.chrsz));}
	this._hex_hmac_md5 = function (key, data) { return this._binl2hex(this._core_hmac_md5(key, data)); }
	this._b64_hmac_md5 = function (key, data) { return this._binl2b64(this._core_hmac_md5(key, data)); }
	this._str_hmac_md5 = function (key, data) { return this._binl2str(this._core_hmac_md5(key, data)); }

	this._hex_sha1 = function (s){return this._binb2hex(this._core_sha1(this._str2binb(s),s.length * this.chrsz));}
	this._b64_sha1 = function (s){return this._binb2b64(this._core_sha1(this._str2binb(s),s.length * this.chrsz));}
	this._str_sha1 = function (s){return this._binb2str(this._core_sha1(this._str2binb(s),s.length * this.chrsz));}
	this._hex_hmac_sha1 = function (key, data){ return this._binb2hex(this._core_hmac_sha1(key, data));}
	this._b64_hmac_sha1 = function (key, data){ return this._binb2b64(this._core_hmac_sha1(key, data));}
	this._str_hmac_sha1 = function (key, data){ return this._binb2str(this._core_hmac_sha1(key, data));}

	/* 
	 * Perform a simple self-test to see if the VM is working 
	 */
	this._md4_vm_test = function ()
	{
	  return this._hex_md4("abc") == "a448017aaf21d8525fc10ae87aa6729d";
	}

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	this._md5_vm_test = function ()
	{
	  return this._hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
	}
	
	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	this._sha1_vm_test = function ()
	{
	  return this._hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
	}
	
	/*
	 * Calculate the MD4 of an array of little-endian words, and a bit length
	 */
	this._core_md4 = function (x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << (len % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;
  
	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = this._md4_ff(a, b, c, d, x[i+ 0], 3 );
	    d = this._md4_ff(d, a, b, c, x[i+ 1], 7 );
	    c = this._md4_ff(c, d, a, b, x[i+ 2], 11);
	    b = this._md4_ff(b, c, d, a, x[i+ 3], 19);
	    a = this._md4_ff(a, b, c, d, x[i+ 4], 3 );
	    d = this._md4_ff(d, a, b, c, x[i+ 5], 7 );
	    c = this._md4_ff(c, d, a, b, x[i+ 6], 11);
	    b = this._md4_ff(b, c, d, a, x[i+ 7], 19);
	    a = this._md4_ff(a, b, c, d, x[i+ 8], 3 );
	    d = this._md4_ff(d, a, b, c, x[i+ 9], 7 );
	    c = this._md4_ff(c, d, a, b, x[i+10], 11);
	    b = this._md4_ff(b, c, d, a, x[i+11], 19);
	    a = this._md4_ff(a, b, c, d, x[i+12], 3 );
	    d = this._md4_ff(d, a, b, c, x[i+13], 7 );
	    c = this._md4_ff(c, d, a, b, x[i+14], 11);
	    b = this._md4_ff(b, c, d, a, x[i+15], 19);

	    a = this._md4_gg(a, b, c, d, x[i+ 0], 3 );
	    d = this._md4_gg(d, a, b, c, x[i+ 4], 5 );
	    c = this._md4_gg(c, d, a, b, x[i+ 8], 9 );
	    b = this._md4_gg(b, c, d, a, x[i+12], 13);
	    a = this._md4_gg(a, b, c, d, x[i+ 1], 3 );
	    d = this._md4_gg(d, a, b, c, x[i+ 5], 5 );
	    c = this._md4_gg(c, d, a, b, x[i+ 9], 9 );
	    b = this._md4_gg(b, c, d, a, x[i+13], 13);
	    a = this._md4_gg(a, b, c, d, x[i+ 2], 3 );
	    d = this._md4_gg(d, a, b, c, x[i+ 6], 5 );
	    c = this._md4_gg(c, d, a, b, x[i+10], 9 );
	    b = this._md4_gg(b, c, d, a, x[i+14], 13);
	    a = this._md4_gg(a, b, c, d, x[i+ 3], 3 );
	    d = this._md4_gg(d, a, b, c, x[i+ 7], 5 );
	    c = this._md4_gg(c, d, a, b, x[i+11], 9 );
	    b = this._md4_gg(b, c, d, a, x[i+15], 13);

	    a = this._md4_hh(a, b, c, d, x[i+ 0], 3 );
	    d = this._md4_hh(d, a, b, c, x[i+ 8], 9 );
	    c = this._md4_hh(c, d, a, b, x[i+ 4], 11);
	    b = this._md4_hh(b, c, d, a, x[i+12], 15);
	    a = this._md4_hh(a, b, c, d, x[i+ 2], 3 );
	    d = this._md4_hh(d, a, b, c, x[i+10], 9 );
	    c = this._md4_hh(c, d, a, b, x[i+ 6], 11);
	    b = this._md4_hh(b, c, d, a, x[i+14], 15);
	    a = this._md4_hh(a, b, c, d, x[i+ 1], 3 );
	    d = this._md4_hh(d, a, b, c, x[i+ 9], 9 );
	    c = this._md4_hh(c, d, a, b, x[i+ 5], 11);
	    b = this._md4_hh(b, c, d, a, x[i+13], 15);
	    a = this._md4_hh(a, b, c, d, x[i+ 3], 3 );
	    d = this._md4_hh(d, a, b, c, x[i+11], 9 );
	    c = this._md4_hh(c, d, a, b, x[i+ 7], 11);
	    b = this._md4_hh(b, c, d, a, x[i+15], 15);

	    a = this._safe_add(a, olda);
	    b = this._safe_add(b, oldb);
	    c = this._safe_add(c, oldc);
	    d = this._safe_add(d, oldd);

	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the basic operation for each round of the
	 * algorithm.
	 */
	this._md4_cmn = function (q, a, b, x, s, t)
	{
	  return this._safe_add(this._bit_rol(this._safe_add(this._safe_add(a, q), this._safe_add(x, t)), s), b);
	}
	this._md4_ff = function (a, b, c, d, x, s)
	{
	  return this._md4_cmn((b & c) | ((~b) & d), a, 0, x, s, 0);
	}
	this._md4_gg = function (a, b, c, d, x, s)
	{
	  return this._md4_cmn((b & c) | (b & d) | (c & d), a, 0, x, s, 1518500249);
	}
	this._md4_hh = function (a, b, c, d, x, s)
	{
	  return this._md4_cmn(b ^ c ^ d, a, 0, x, s, 1859775393);
	}

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	this._core_md5 = function (x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;
	
	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;
	
	  for(var i = 0; i < x.length; i += 16)
	  {
		var olda = a;
		var oldb = b;
		var oldc = c;
		var oldd = d;
	
		a = this._md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
		d = this._md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
		c = this._md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
		b = this._md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
		a = this._md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
		d = this._md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
		c = this._md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
		b = this._md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
		a = this._md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
		d = this._md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
		c = this._md5_ff(c, d, a, b, x[i+10], 17, -42063);
		b = this._md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
		a = this._md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
		d = this._md5_ff(d, a, b, c, x[i+13], 12, -40341101);
		c = this._md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
		b = this._md5_ff(b, c, d, a, x[i+15], 22,  1236535329);
	
		a = this._md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
		d = this._md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
		c = this._md5_gg(c, d, a, b, x[i+11], 14,  643717713);
		b = this._md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
		a = this._md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
		d = this._md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
		c = this._md5_gg(c, d, a, b, x[i+15], 14, -660478335);
		b = this._md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
		a = this._md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
		d = this._md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
		c = this._md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
		b = this._md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
		a = this._md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
		d = this._md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
		c = this._md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
		b = this._md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
	
		a = this._md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
		d = this._md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
		c = this._md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
		b = this._md5_hh(b, c, d, a, x[i+14], 23, -35309556);
		a = this._md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
		d = this._md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
		c = this._md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
		b = this._md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
		a = this._md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
		d = this._md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
		c = this._md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
		b = this._md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
		a = this._md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
		d = this._md5_hh(d, a, b, c, x[i+12], 11, -421815835);
		c = this._md5_hh(c, d, a, b, x[i+15], 16,  530742520);
		b = this._md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
	
		a = this._md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
		d = this._md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
		c = this._md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
		b = this._md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
		a = this._md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
		d = this._md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
		c = this._md5_ii(c, d, a, b, x[i+10], 15, -1051523);
		b = this._md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
		a = this._md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
		d = this._md5_ii(d, a, b, c, x[i+15], 10, -30611744);
		c = this._md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
		b = this._md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
		a = this._md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
		d = this._md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
		c = this._md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
		b = this._md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
	
		a = this._safe_add(a, olda);
		b = this._safe_add(b, oldb);
		c = this._safe_add(c, oldc);
		d = this._safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);
	
	}
	
	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	this._md5_cmn = function (q, a, b, x, s, t)
	{
	  return this._safe_add(this._bit_rol(this._safe_add(this._safe_add(a, q), this._safe_add(x, t)), s),b);
	}
	this._md5_ff = function (a, b, c, d, x, s, t)
	{
	  return this._md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	this._md5_gg = function (a, b, c, d, x, s, t)
	{
	  return this._md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	this._md5_hh = function (a, b, c, d, x, s, t)
	{
	  return this._md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	this._md5_ii = function (a, b, c, d, x, s, t)
	{
	  return this._md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}
	
	/*
	 * Calculate the SHA-1 of an array of big-endian words, and a bit length
	 */
	this._core_sha1 = function (x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << (24 - len % 32);
	  x[((len + 64 >> 9) << 4) + 15] = len;
	
	  var w = Array(80);
	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;
	  var e = -1009589776;
	
	  for(var i = 0; i < x.length; i += 16)
	  {
		var olda = a;
		var oldb = b;
		var oldc = c;
		var oldd = d;
		var olde = e;
	
		for(var j = 0; j < 80; j++)
		{
		  if(j < 16) w[j] = x[i + j];
		  else w[j] = this._bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
		  var t = this._safe_add(this._safe_add(this._bit_rol(a, 5), this._sha1_ft(j, b, c, d)),
						   this._safe_add(this._safe_add(e, w[j]), this._sha1_kt(j)));
		  e = d;
		  d = c;
		  c = this._bit_rol(b, 30);
		  b = a;
		  a = t;
		}
	
		a = this._safe_add(a, olda);
		b = this._safe_add(b, oldb);
		c = this._safe_add(c, oldc);
		d = this._safe_add(d, oldd);
		e = this._safe_add(e, olde);
	  }
	  return Array(a, b, c, d, e);
	
	}
	
	/*
	 * Perform the appropriate triplet combination function for the current
	 * iteration
	 */
	this._sha1_ft = function (t, b, c, d)
	{
	  if(t < 20) return (b & c) | ((~b) & d);
	  if(t < 40) return b ^ c ^ d;
	  if(t < 60) return (b & c) | (b & d) | (c & d);
	  return b ^ c ^ d;
	}
	
	/*
	 * Determine the appropriate additive constant for the current iteration
	 */
	this._sha1_kt = function (t)
	{
	  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
			 (t < 60) ? -1894007588 : -899497514;
	}
	
	/*
	 * Calculate the HMAC-MD4, of a key and some data
	 */
	this._core_hmac_md4 = function (key, data)
	{
	  var bkey = this._str2binl(key);
	  if(bkey.length > 16) bkey = this._core_md4(bkey, key.length * this.chrsz);
	
	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++) 
	  {
		ipad[i] = bkey[i] ^ 0x36363636;
		opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }
	
	  var hash = this._core_md4(ipad.concat(this._str2binl(data)), 512 + data.length * this.chrsz);
	  return this._core_md4(opad.concat(hash), 512 + 128);
	}

	/*
	 * Calculate the HMAC-MD5, of a key and some data
	 */
	this._core_hmac_md5 = function (key, data)
	{
	  var bkey = this._str2binl(key);
	  if(bkey.length > 16) bkey = this._core_md5(bkey, key.length * this.chrsz);
	
	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	  {
		ipad[i] = bkey[i] ^ 0x36363636;
		opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }
	
	  var hash = this._core_md5(ipad.concat(this._str2binl(data)), 512 + data.length * this.chrsz);
	  return this._core_md5(opad.concat(hash), 512 + 128);
	}
	
	/*
	 * Calculate the HMAC-SHA1 of a key and some data
	 */
	this._core_hmac_sha1 = function (key, data)
	{
	  var bkey = this._str2binb(key);
	  if(bkey.length > 16) bkey = this._core_sha1(bkey, key.length * this.chrsz);
	
	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	  {
		ipad[i] = bkey[i] ^ 0x36363636;
		opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }
	
	  var hash = this._core_sha1(ipad.concat(this._str2binb(data)), 512 + data.length * this.chrsz);
	  return this._core_sha1(opad.concat(hash), 512 + 160);
	}
	
	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	this._safe_add = function (x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	this._bit_rol = function (num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}
	
	/*
	 * Convert a string to an array of little-endian words
	 * If this.chrsz is ASCII, characters >255 have their hi-byte silently ignored.
	 */
	this._str2binl = function (str)
	{
	  var bin = Array();
	  var mask = (1 << this.chrsz) - 1;
	  for(var i = 0; i < str.length * this.chrsz; i += this.chrsz)
		bin[i>>5] |= (str.charCodeAt(i / this.chrsz) & mask) << (i%32);
	  return bin;
	}
	
	/*
	 * Convert an array of little-endian words to a string
	 */
	this._binl2str = function (bin)
	{
	  var str = "";
	  var mask = (1 << this.chrsz) - 1;
	  for(var i = 0; i < bin.length * 32; i += this.chrsz)
		str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
	  return str;
	}
	
	/*
	 * Convert an array of little-endian words to a hex string.
	 */
	this._binl2hex = function (binarray)
	{
	  var hex_tab = this.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i++)
	  {
		str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
			   hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
	  }
	  return str;
	}
	
	/*
	 * Convert an array of little-endian words to a base-64 string
	 */
	this._binl2b64 = function (binarray)
	{
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i += 3)
	  {
		var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
					| (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
					|  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
		for(var j = 0; j < 4; j++)
		{
		  if(i * 8 + j * 6 > binarray.length * 32) str += this.b64pad;
		  else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
		}
	  }
	  return str;
	}

	/*
	 * Convert an 8-bit or 16-bit string to an array of big-endian words
	 * In 8-bit function, characters >255 have their hi-byte silently ignored.
	 */
	this._str2binb = function (str)
	{
	  var bin = Array();
	  var mask = (1 << this.chrsz) - 1;
	  for(var i = 0; i < str.length * this.chrsz; i += this.chrsz)
		bin[i>>5] |= (str.charCodeAt(i / this.chrsz) & mask) << (32 - this.chrsz - i%32);
	  return bin;
	}
	
	/*
	 * Convert an array of big-endian words to a string
	 */
	this._binb2str = function (bin)
	{
	  var str = "";
	  var mask = (1 << this.chrsz) - 1;
	  for(var i = 0; i < bin.length * 32; i += this.chrsz)
		str += String.fromCharCode((bin[i>>5] >>> (32 - this.chrsz - i%32)) & mask);
	  return str;
	}
	
	/*
	 * Convert an array of big-endian words to a hex string.
	 */
	this._binb2hex = function (binarray)
	{
	  var hex_tab = this.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i++)
	  {
		str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
			   hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
	  }
	  return str;
	}
	
	/*
	 * Convert an array of big-endian words to a base-64 string
	 */
	this._binb2b64 = function (binarray)
	{
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i += 3)
	  {
		var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
					| (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
					|  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
		for(var j = 0; j < 4; j++)
		{
		  if(i * 8 + j * 6 > binarray.length * 32) str += this.b64pad;
		  else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
		}
	  }
	  return str;
	}

	// Default parameters.
	if (!hashMethod) hashMethod = "md5";
	if (!outputEncoding) outputEncoding = "hex";

	if (stringToHash)
	{
			switch (hashMethod.toLowerCase())
			{
					case "md4":
						switch (outputEncoding.toLowerCase())
						{
								case "b64":
									return this._b64_md4 (stringToHash);
									break;
								case "str":
									return this._str_md4 (stringToHash);
									break;
								case "hex":
								default:
									return this._hex_md4 (stringToHash);
									break;
						}
					case "sha1":
						switch (outputEncoding)
						{
								case "b64":
									return this._b64_sha1 (stringToHash);
									break;
								case "str":
									return this._str_sha1 (stringToHash);
									break;
								case "hex":
								default:
									return this._hex_sha1 (stringToHash);
									break;
						}
					case "md5":
					default:
						switch (outputEncoding)
						{
								case "b64":
									return this._b64_md5 (stringToHash);
									break;
								case "str":
									return this._str_md5 (stringToHash);
									break;
								case "hex":
								default:
									return this._hex_md5 (stringToHash);
									break;
						}
			}
	} else {
			return null;
	}

}