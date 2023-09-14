# hanziyu
Sources and Code for Hanziyu Conlang

sources.md includes image sources for the video, research resources, and sources of data for decomposition, radicals, etc.


I use bun as my js/ts runtime, so to use npm one would need to transpile the typescript. 

# Example commands

`bun parser.ts [desired text here]`
`bun reader.js [desired text here]`

Parser actually generates out the words and prints their decompositions, while reader simply pretty prints the romanization.

If there is a prompt with a character followed by a colon, this means that this component must be manually defined by you. This entry will then be saved for future occurences.

# Information
All of the manually entered radical information is in `radical-decomp.json`, and the original dictionary is `dictionary.json`.
