package RPW;

import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.concurrent.ThreadLocalRandom;
import java.awt.datatransfer.*;
import java.awt.Toolkit;
import javax.swing.*;
import javax.swing.border.Border;

public class RandomPWGui extends JFrame
implements ActionListener 
{
	
	int input;
	int min = 0x21;
	int max = 0x5B;
	JTextField numberPW;
	JTextField resultPW;
	JButton enter;
	JButton clear;
	JButton clipboard;
	
	public RandomPWGui() 
	{
		//JFrame default Operations + name of window
		setTitle("Zufallspasswort Generator");
		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		this.setLayout(new FlowLayout(FlowLayout.CENTER));
		this.setPreferredSize(new Dimension(450,400));
		
		//Labels
		JLabel l1 = new JLabel("Anzahl an Stellen (maximal 50)");
		JLabel l2 = new JLabel("Zufallspasswort");
		
		numberPW = new JTextField("0",50);
		resultPW = new JTextField("0",50);
		resultPW.setEditable(false);
		numberPW.setEditable(true);
		
		//Buttons
		enter = new JButton("Zufallspasswort erzeugen");
		clear = new JButton("Ein-/Ausgabe leeren");
		clipboard = new JButton("Passwort kopieren");
		
		//register buttons at Action Listener
		enter.addActionListener(this);
		clear.addActionListener(this);
		clipboard.addActionListener(this);
		
		//JPanel for number field
		JPanel panelNumber = new JPanel();
		
		//Border for JPanel panelNumber
		Border border = BorderFactory.createTitledBorder("Eingabe");
		panelNumber.setBorder(border);
		panelNumber.setLayout(new BoxLayout(panelNumber, BoxLayout.PAGE_AXIS));

		//add number field to JPanel panelNumber
		panelNumber.add(l1);
		panelNumber.add(numberPW);
		
		//JPanel for result field
		JPanel panelResult = new JPanel();
		
		//Border for JPanel panelResult
		Border border2 = BorderFactory.createTitledBorder("Ausgabe");
		panelResult.setBorder(border2);
		panelResult.setLayout(new BoxLayout(panelResult, BoxLayout.PAGE_AXIS));

		//add result field to JPanel panelResult
		panelResult.add(l2);
		panelResult.add(resultPW);
		
		//JPanel for number and result field 
		JPanel panel1 = new JPanel();
		
		//add number and result field to JPanel1
		panel1.setPreferredSize(new Dimension(440, 130));
		panel1.setLayout(new BoxLayout(panel1, BoxLayout.PAGE_AXIS));
		panel1.add(panelNumber);
		panel1.add(panelResult);
		
		//JPanel for enter button
		JPanel panel2 = new JPanel();
		panel2.add(enter);
		
		//JPanel for clear button
		JPanel panel3 = new JPanel();
		panel3.add(clear);
		
		//JPanel for clipboard button
		JPanel panel4 = new JPanel();
		panel4.add(clipboard);
		
		//main JPanel
		JPanel panel = new JPanel();
		
		//add all panels to main JPanel
		panel.add(panel1);
		panel.add(panel2);
		panel.add(panel3);
		panel.add(panel4);
		panel.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));
		setContentPane(panel);
		pack();
		setResizable(false);
		setVisible(true);
	}
	
	//Method to check if input is a number
	public boolean isNumber(String s) 
	{
		try 
		{
			input = Integer.parseInt(s);
		} 
		catch (NumberFormatException x) 
		{
			numberPW.setText("" + 0);
			resultPW.setText("" + 0);
			return false;
		}
		return true;
	}

	@Override
	public void actionPerformed(ActionEvent e) 
	{
		Object source = e.getSource();
		String s = numberPW.getText();
	   
	    if (source == enter) 
	    {
	    	if (isNumber(s)) 
	    	{
	    		if (input > 50) 
	    		{
	    			JOptionPane.showMessageDialog(
	    			this,
	    			"Eingabefehler: maximal 50 Stellen"
	    			);
	    			return;
	    		}
	    		
	    		if (input == 0) 
	    		{
	    			resultPW.setText("" + 0);
	    			return;
	    		}
	    		
	    		if (input < 0) 
	    		{
	    			JOptionPane.showMessageDialog(
	    			this,
	    			"Eingabefehler: negative Zahl"
	    			);
	    			return;
	    		}
	    		
	    		char a[] = new char[50];
	    		
	    		for (int i = 0; i < input; ++i)
	        	{   
	    			int tmp = ThreadLocalRandom.current().nextInt(min, max + 1);
	    			a[i] = (char) (tmp);
	        	}
	    		
	    		String output = String.valueOf(a);
				resultPW.setText("" + (output));
	    		
	    	} else 
	    	{
    			JOptionPane.showMessageDialog(
    			this,
    			"Eingabefehler: keine (ganze) Zahl eingegeben"
    			);
    			return;
	    	}
	    }
	    
    	if (source == clear) 
    	{
    		numberPW.setText("" + 0);
			resultPW.setText("" + 0);
			return;
    	}
    	
    	if (source == clipboard) 
    	{
    		String randomPW = resultPW.getText();
    		StringSelection stringSelection = new StringSelection(randomPW);
    		Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
    		clipboard.setContents(stringSelection, null);
    		
			JOptionPane.showMessageDialog(
			this,
			"Passwort wurde in die Zwischenablage kopiert"
			);
			return;
    	}
	}

	public static void main(String[] args) {
		JFrame myApplication = new RandomPWGui();

	}

}
