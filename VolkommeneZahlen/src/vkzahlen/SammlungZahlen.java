package vkzahlen;

import java.awt.List;
import java.util.ArrayList;

public class SammlungZahlen {
	
	int cycles = 0;
	
	public static int sumAlleTeiler (int zahl) {
		ArrayList<Integer> teiler = new ArrayList<Integer>();
		int sum = 0;
		
		for (int i = 1; i < zahl; i++) {
			if (zahl % i == 0) {
				teiler.add(i);
			}
		}
		
		for (int n : teiler) {
			sum += n;
		}
		
		return sum;
	}
	
	public static int sucheVollkommeneZahl(int zahl) {
		if (sumAlleTeiler(zahl) == zahl) {
			return zahl;
		}
		
		return 0;
	}
	
	public static void main(String[] args) {
		ArrayList<Integer> vkzahlen = new ArrayList<Integer>();
		for (int i = 1; i < 100000; i++) {
			if (sucheVollkommeneZahl(i) != 0) {
				int tmp = sucheVollkommeneZahl(i);
				vkzahlen.add(tmp);
			}
		}
		
		for (int n : vkzahlen) {
			System.out.print(n + ", ");
		}
		//System.out.println(sumAlleTeiler(12));
	}
}
