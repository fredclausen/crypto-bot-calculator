# Crypto Bot Calculator

## Intro

CBC is a small electron application that is meant to be used to calculate Dollar Cost Average (`DCA`) bot money usage and help users determine how much of a risk their current settings are.

## Installing Crypto Bot Calculator

From the release page you can download the most recent `Mac` or `Windows` version of the application.

## Using Crypto Bot Calculator

### inputs

The following inputs are available

| ----- | ----- |
| `Free Cash` | This is your current unused cash that you wish the bots to be able to use |
| `Total Cash in Bots` | If you have bots running, this is the amount they are using. It will be added to `Free Cash` to give the total amount of cash your bots might use |
| `Number of bots` | The number of bots you are/want to be running |
| `Base order size` | The size of your base order |
| `Safety Order Size` | The size of your Safety Orders the bot will place |
| `Safety Order Scaling` | How your bot will scale the Safety Orders as they are place |
| `Max Safety Orders` | The total number of Safety Orders your bot can place |

### Outputs

| ----- | ----- |
| `Total Cash` | The total amount of cash your bots will have access to |
| `Extra Cash` | The total amount of cash you have available for the bots, but **NOT** used |
| `Amount per bot` | The maximum amount of cash one bot could use |
| `Possible extra bots` | The total number of extra bots you could run and safely cover all trades (Base + SOs) the bots could possibly use. |

## Issues and improvements

* The calculator doesn't factor in trading fees, so if you use the same numbers on a site like 3Commas you may see the site indicate the bot will use slightly more cash than CBC.
* All bots are assumed to be set up the same. Future improvement will be to allow bots to be individually set up
* Localization is may or may not work.
