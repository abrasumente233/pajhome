/*
   Author: Bobby Kenny
   Email:  borrisoleigh@hotmail.com

   Implementation of the RSA Algorithm:
   Program Computes Public and Private keys.
   The user then inputs an integer to be encrypted
   using the private key. Ths encrypted integer is
   then decrypted and is compared with the original
   integer.
*/

import java.math.BigInteger;
import java.security.SecureRandom;

class BigExtendedEuclid 
{
	// We Want to obtain the gcd(a,b)
	//                          a			 b				0			 1				1			 0
	public BigInteger[] EE(BigInteger a, BigInteger b, BigInteger c, BigInteger d, BigInteger e, BigInteger f)
	{
		if (b.compareTo(BigInteger.ZERO)==0)
		{
			BigInteger[] ret  = {BigInteger.ZERO, BigInteger.ZERO, BigInteger.ZERO};
			ret[0] = a; // gcd(a,b)
			ret[1] = e; // coefficient of a
			ret[2] = f; // coefficient of b
			return ret; 
		}
		else
		{
			return  EE(b, a.mod(b), e.subtract((a.divide(b)).multiply(c)), f.subtract((a.divide(b)).multiply(d)), c, d);
		}
	}
}

class MillerRabin 
{
	public int primeT(BigInteger pval)
	{
		BigInteger [] qandm = getqm(pval);
		BigInteger qval =qandm[0];
		BigInteger neg = new BigInteger("-1");
		if (qval.compareTo(neg)==0)return 0;

		SecureRandom r = new SecureRandom();
		BigInteger bval = new BigInteger(pval.bitLength(),r);
		
		
		BigInteger mval =qandm[1];
		BigInteger two = new BigInteger("2");
		
		BigInteger pminusone = pval.subtract(BigInteger.ONE);

			
		if (bval.modPow(mval,pval).compareTo(BigInteger.ONE)==0)return 1;
		BigInteger j = BigInteger.ZERO;
		BigInteger indexval = mval;
		while (j.compareTo(qval)<0)
		{
			if (pminusone.compareTo(bval.modPow(indexval,pval))==0)return 1;
			indexval = indexval.multiply(two);
			j = j.add(BigInteger.ONE);			
		}
		return 0;
	}

	public BigInteger createPrime(int bitlength, int numTests)
	{
		SecureRandom r = new SecureRandom();
		BigInteger p = new BigInteger(bitlength,r);
		int h = 0;

		while(h < numTests)
		{
			if(primeT(p)==0)break;
			else h++;
		}
		if(h==numTests)return p;
		else return createPrime(bitlength, numTests);
	}

	public BigInteger [] getqm(BigInteger p)
	{
		p = p.subtract(BigInteger.ONE);
		BigInteger two = new BigInteger("2");
		BigInteger neg = new BigInteger("-1");
		BigInteger [] rt ={BigInteger.ZERO, BigInteger.ZERO}; // rt = {q, m}
		if (p.mod(two).compareTo(BigInteger.ZERO) != 0)
		{
			rt[0] = neg; rt[1] = neg;
			return rt;
		}
		BigInteger divisor = p.divide(two);
		BigInteger counter = BigInteger.ONE;
		//double maxq = (Math.log(p))/(Math.log(2));
		while (/*count <= maxq && */divisor.mod(two).compareTo(BigInteger.ZERO)==0)
		{
			counter = counter.add(BigInteger.ONE);
			divisor = divisor.divide(two);
		}
		rt[0] = counter; rt[1] = divisor;
		return rt;
	}
}

class myRSA
{
	public static void main(String[] args)
	{
		BigInteger N, D, E, P, Q, M;
		// First task is to find P and Q : Primes with a specifies bit length

		System.out.print("Enter Bit length   \t:");
        int bitlen = Console.readInt();

		MillerRabin test = new MillerRabin();
		P = test.createPrime(bitlen/2, 100);
		Q = test.createPrime(bitlen/2, 100);

		// P and Q must not be equal
		while(P.compareTo(Q) == 0)
		{
			Q = test.createPrime(bitlen/2, 100);
		}
		System.out.println("P               \t:"+P);
		System.out.println("Q               \t:"+Q);
				
		// N is the product of P and Q
		N = P.multiply(Q);
		System.out.println("N = P*Q           \t:"+N);

		// M is the product of (P-1) and (Q-1)
		M = (P.subtract(BigInteger.ONE)).multiply(Q.subtract(BigInteger.ONE));
		System.out.println("M = (P-1)*(Q-1)     \t:"+M);

		// The public key E must be coprime to M
		E = new BigInteger("3");
		while(M.gcd(E).intValue() > 1)
		{
			E = E.add(new BigInteger("2"));
		}
		System.out.println("E                \t:"+E);
		
		// The private key D must satisfy DE = 1 mod M
		BigExtendedEuclid ee = new BigExtendedEuclid();
		BigInteger [] arra = ee.EE(E, M, BigInteger.ZERO, BigInteger.ONE, BigInteger.ONE, BigInteger.ZERO);
		System.out.println("gcd is :" +arra[0] + " = "+arra[1] + "E + "+arra[2]+"M");
		D = arra[1];
		while (D.compareTo(BigInteger.ZERO)<0)
		{
			D = D.add(M);
		}
		System.out.println("D                \t:"+D);

		System.out.print("Enter integer to be encrypted  :");
		BigInteger big = new BigInteger(Console.readString());

		// Encryption process: en = big^{E} mod N
		BigInteger en = big.modPow(E, N);
		System.out.println("Encrypted number \t:"+en);

		// Decryption process: de = en^{D} mod N
		BigInteger de = en.modPow(D, N);
		System.out.println("Decrypted number \t:"+de);

		if (big.compareTo(de) == 0)System.out.println("Success!");
		else System.out.println("Not Equal");
	}
}