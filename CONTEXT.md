# Voting App

An Operator posts Polls; anonymous Voters each cast one Vote per Poll and then see its Result.

## Language

### Polls

**Poll**:
A single Question together with 2–10 Options, posted by the Operator. A Poll accepts Votes until the Operator deletes it; it is never edited or closed. Deleting a Poll removes it and its Votes permanently. Several Polls can exist at once.
_Avoid_: Vote (for the whole thing), Question (for the whole thing), Survey, Ballot, 투표 (ambiguous)

**Question**:
The text of a Poll that Voters answer, e.g. "점심 뭐 먹을까?".
_Avoid_: Title, Topic

**Option**:
One of the choices within a Poll. Options within a Poll are distinct and keep the order the Operator entered them in.
_Avoid_: Choice, Answer, Item

**Vote**:
One Voter's selection of exactly one Option in a Poll. A Vote is final: it cannot be changed or withdrawn.
_Avoid_: Ballot, Response, 투표 (ambiguous)

**Result**:
The tally of Votes per Option for a Poll. A Voter sees it only after casting a Vote in that Poll; the Operator always sees it.
_Avoid_: Stats, Score

### People

**Operator**:
The person who posts and deletes Polls, signed in with the single shared password. The Operator's browser is also a Voter.
_Avoid_: Admin, Manager, Owner

**Voter**:
An anonymous visitor who casts Votes. One Voter is one browser; a Voter gets at most one Vote per Poll.
_Avoid_: User, Participant
