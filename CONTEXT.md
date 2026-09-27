# Voting App

An Operator posts Polls; anonymous Voters each cast one Vote per Poll and then see its Result.

## Language

### Polls

**Poll**:
A single Question together with 2–10 Options, an optional Deadline and a Chart Type, posted by the Operator. A Poll is never edited after posting. It accepts Votes until it is Closed or deleted. Deleting a Poll removes it and its Votes permanently. Several Polls can exist at once.
_Avoid_: Vote (for the whole thing), Question (for the whole thing), Survey, Ballot, 투표 (ambiguous)

**Question**:
The text of a Poll that Voters answer, e.g. "점심 뭐 먹을까?".
_Avoid_: Title, Topic

**Option**:
One of the choices within a Poll. Options within a Poll are distinct and keep the order the Operator entered them in.
_Avoid_: Choice, Answer, Item

**Deadline**:
The moment after which a Poll accepts no more Votes, set by the Operator when posting and never changed. A Poll without a Deadline stays open until deleted.
_Avoid_: End time, Expiry, Close date, 마감시간 (in code)

**Closed**:
The state of a Poll whose Deadline has passed. A Closed Poll accepts no Votes and shows its Result to everyone.
_Avoid_: Ended, Expired, Finished

**Vote**:
One Voter's selection of exactly one Option in a Poll. A Vote is final: it cannot be changed or withdrawn.
_Avoid_: Ballot, Response, 투표 (ambiguous)

**Result**:
The tally of Votes per Option for a Poll. A Voter sees it only after casting a Vote in that Poll or once the Poll is Closed; the Operator always sees it.
_Avoid_: Stats, Score

**Chart Type**:
How a Poll's Result is drawn, chosen by the Operator when posting. Some Chart Types are only allowed for Polls with few Options.
_Avoid_: Graph style, Visualization

### People

**Operator**:
The person who posts and deletes Polls, signed in with the single shared password. The Operator's browser is also a Voter.
_Avoid_: Admin, Manager, Owner

**Voter**:
An anonymous visitor who casts Votes. One Voter is one browser; a Voter gets at most one Vote per Poll.
_Avoid_: User, Participant
