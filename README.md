# BrainOrBot

A minimal zero-dependency package for recording the duration of button presses and mouse-click presses, along with the movement data surrounded each mouse-click.

I built this app on a whim that it could help combat #MTurkBotGate via inspection of the distribution of the duration of button press durations.
H0: Bots and Brains have identical distributions
H1: Bots have v peaked distributions. Brains, spread out.
H2: Brains who 'cant be bothered' perhaps move to more peakedness over course of study.

There is a discussion on this on facebook's [PsychMap group](https://www.facebook.com/groups/psychmap/?multi_permalinks=669577576752501&notif_id=1534702943033625&notif_t=feedback_reaction_generic).

Get in contact if you want to pursue this. Happy to help.

## Getting Started

### Installing

Download brainOrBot.js. Import it into your html file containing your study like shown below.
```
<!DOCTYPE html>
<html lang="en">
<head>
    <script type="text/javascript" src="brainOrBot.js"></script>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
</body>
</html>
```

And that's it! Button and click presses will start being recorded immediately. To reset:

```
brainOrBot.reset();
```

To get the current distribution of button/mouse down durations over 2000ms blocks:

```
brainOrBot.get_button_dist(2000);
brainOrBot.get_click_dist(2000);
//["", 144.00000000023283, 84.00000000256114, 201.65000000270084, 85.79999998619314]
//with each number in the array representing the average mouse button down time for a 2000ms block of time.
```

## Todo
Figure out some metrics for movement data for before and after mouse clicks.

## Running the tests

Tests done with Tape. None done so far.
```
npm tests/*.js
```
