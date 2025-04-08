import {
  Category,
  Profile,
  Statement,
  SXProposal,
  SXSpace,
  SXUser,
  Topic,
  TopicVote,
  User,
  Vote
} from '../../.checkpoint/models';
import { getJSON } from '../utils';
import { Writer } from './indexer/types';
import { getEntity } from './utils';
import { getVotingPower } from './vp';

/* Discussions */

const indexerName = 'highlight';

export const handleAddCategory: Writer = async ({ payload }) => {
  console.log('Handle add category', payload);

  const [id, parent, metadataURI] = payload.data;

  const category = new Category(id, indexerName);
  category.parent = parent;
  category.metadata_uri = metadataURI;

  try {
    const metadata: any = await getJSON(metadataURI);

    if (metadata.name) category.name = metadata.name;
    if (metadata.about) category.about = metadata.about;
  } catch (e) {
    console.log(e);
  }

  await category.save();

  if (parent !== 0) {
    const parentCategory = await Category.loadEntity(
      category.parent,
      indexerName
    );

    if (parentCategory) {
      parentCategory.category_count += 1;

      await parentCategory.save();
    }
  }
};

export const handleEditCategory: Writer = async ({ payload }) => {
  console.log('Handle edit category', payload);

  const [id, metadataURI] = payload.data;

  const category = await Category.loadEntity(id, indexerName);

  if (category) {
    try {
      const metadata: any = await getJSON(metadataURI);

      if (metadata.name) category.name = metadata.name;
      if (metadata.about) category.about = metadata.about;

      await category.save();
    } catch (e) {
      console.log(e);
    }
  }
};

export const handleRemoveCategory: Writer = async ({ payload }) => {
  console.log('Handle remove category', payload);

  const [id] = payload.data;

  const category = await Category.loadEntity(id, indexerName);

  if (category) {
    const parent = category.parent || 0;

    if (parent !== 0) {
      const parentCategory = await Category.loadEntity(parent, indexerName);

      if (parentCategory) {
        parentCategory.category_count -= 1;

        await parentCategory.save();
      }
    }

    await category.delete();
  }
};

export const handleAddTopic: Writer = async ({ payload }) => {
  console.log('Handle add topic', payload);

  const [id, author, categoryId, parent, metadataUri] = payload.data;

  const topic = new Topic(id, indexerName);
  if (categoryId) topic.category = categoryId;
  topic.author = author;
  topic.parent = parent;
  topic.metadata_uri = metadataUri;
  topic.pinned = false;

  try {
    const metadata: any = await getJSON(metadataUri);

    if (metadata.title) topic.title = metadata.title;
    if (metadata.content) topic.content = metadata.content;
  } catch (e) {
    console.log(e);
  }

  await topic.save();

  if (parent !== 0) {
    const parentTopic = await Topic.loadEntity(parent, indexerName);

    if (parentTopic) {
      parentTopic.reply_count += 1;

      await parentTopic.save();
    }
  } else {
    const category = await Category.loadEntity(categoryId, indexerName);
    if (category) {
      category.topic_count += 1;

      await category.save();
    }
  }

  const user: User = await getEntity(User, author, indexerName);
  const profile: Profile = await getEntity(Profile, author, indexerName);

  user.profile = author;
  user.topic_count += 1;
  profile.user = author;

  await user.save();
  await profile.save();
};

export const handleEditTopic: Writer = async ({ payload }) => {
  console.log('Handle edit topic', payload);

  const [id, metadataURI] = payload.data;

  const topic = await Topic.loadEntity(id, indexerName);

  if (topic) {
    try {
      const metadata: any = await getJSON(metadataURI);

      if (metadata.title) topic.title = metadata.title;
      if (metadata.content) topic.content = metadata.content;

      await topic.save();
    } catch (e) {
      console.log(e);
    }
  }
};

export const handleRemoveTopic: Writer = async ({ payload }) => {
  console.log('Handle remove topic', payload);

  const [id] = payload.data;

  const topic = await Topic.loadEntity(id, indexerName);

  if (topic) {
    await topic.delete();
  }
};

export const handlePinTopic: Writer = async ({ payload }) => {
  console.log('Handle pin topic', payload);

  const [id] = payload.data;

  const topic = await Topic.loadEntity(id, indexerName);

  if (topic) {
    topic.pinned = true;

    await topic.save();
  }
};

export const handleUnpinTopic: Writer = async ({ payload }) => {
  console.log('Handle unpin topic', payload);

  const [id] = payload.data;

  const topic = await Topic.loadEntity(id, indexerName);

  if (topic) {
    topic.pinned = false;

    await topic.save();
  }
};

export const handleTopicVote: Writer = async ({ payload }) => {
  console.log('Handle topic vote', payload);

  const [voter, topicId, choice] = payload.data;
  const id = `${voter}/${topicId}`;
  let newVote = false;
  let previousVoteScore = 0;

  let vote = await TopicVote.loadEntity(id, indexerName);
  if (!vote) {
    vote = new TopicVote(id, indexerName);
    newVote = true;
  } else {
    previousVoteScore = vote.choice === 0 ? -1 : 1;
  }
  vote.voter = voter;
  vote.topic = topicId;
  vote.choice = choice;

  const score = choice === 0 ? -1 : 1;

  await vote.save();

  const topic = await Topic.loadEntity(topicId, indexerName);

  if (topic) {
    topic.score += score;
    if (newVote) {
      topic.vote_count += 1;
    } else {
      topic.score -= previousVoteScore;
    }

    await topic.save();
  }

  const user: User = await getEntity(User, voter, indexerName);
  const profile: Profile = await getEntity(Profile, voter, indexerName);

  user.profile = voter;
  user.topic_vote_count += 1;
  profile.user = voter;

  await user.save();
  await profile.save();
};

export const handleTopicUnvote: Writer = async ({ payload }) => {
  console.log('Handle topic unvote', payload);

  const [voter, topic] = payload.data;
  const id = `${voter}/${topic}`;

  const vote = await TopicVote.loadEntity(id, indexerName);

  if (vote) {
    await vote.delete();
  }

  const user: User = await getEntity(User, voter, indexerName);
  const profile: Profile = await getEntity(Profile, voter, indexerName);

  user.profile = voter;
  user.topic_vote_count -= 1;
  profile.user = voter;

  await user.save();
  await profile.save();
};

/* Profiles */

export const handleSetProfile: Writer = async ({ payload }) => {
  console.log('Handle set profile', payload);

  const [id, metadataUri] = payload.data;

  const user: User = await getEntity(User, id, indexerName);
  const profile: Profile = await getEntity(Profile, id, indexerName);

  user.profile = id;
  profile.user = id;
  profile.updated = ~~(Date.now() / 1e3);

  try {
    const metadata: any = await getJSON(metadataUri);

    if (metadata.name) profile.name = metadata.name;
    if (metadata.about) profile.about = metadata.about;
    if (metadata.twitter) profile.twitter = metadata.twitter;
    if (metadata.discord) profile.discord = metadata.discord;
    if (metadata.telegram) profile.telegram = metadata.telegram;
    if (metadata.github) profile.github = metadata.github;
  } catch (e) {
    console.log(e);
  }

  await user.save();
  await profile.save();
};

export const handleSetStatement: Writer = async ({ payload }) => {
  console.log('Handle set statement', payload);

  const [id, org, metadataUri] = payload.data;

  const user: User = await getEntity(User, id, indexerName);
  const statement: Statement = await getEntity(
    Statement,
    `${id}/${org}`,
    indexerName
  );

  statement.user = id;
  statement.org = org;
  statement.updated = ~~(Date.now() / 1e3);

  try {
    const metadata: any = await getJSON(metadataUri);

    if (metadata.statement) statement.statement = metadata.statement;
    if (metadata.status) statement.status = metadata.status;
  } catch (e) {
    console.log(e);
  }

  await user.save();
  await statement.save();
};

/* Votes */

export const handleVote: Writer = async ({ payload }) => {
  console.log('Handle vote', payload);

  const mapChoice = (rawChoice: number): 1 | 2 | 3 => {
    if (rawChoice === 0) return 2;
    else if (rawChoice === 1) return 1;
    else if (rawChoice === 2) return 3;
    throw new Error('Invalid choice');
  };

  const [space, voter, proposalId, rawChoice, chainId, sig] = payload.data;
  const uniqueProposalId = `${space}/${proposalId}`;
  const id = `${uniqueProposalId}/${voter}`;
  const timestamp = ~~(Date.now() / 1e3); // @TODO change to unit timestamp
  const choice = mapChoice(rawChoice);

  const vp = await getVotingPower(space, proposalId, voter, chainId);
  const userEntity: SXUser = await getEntity(SXUser, voter, indexerName);
  const spaceEntity: SXSpace = await getEntity(SXSpace, space, indexerName);
  const proposalEntity: SXProposal = await getEntity(
    SXProposal,
    uniqueProposalId,
    indexerName
  );
  const vote: Vote = await getEntity(Vote, id, indexerName);

  userEntity.vote_count += 1;
  userEntity.created = timestamp;
  spaceEntity.vote_count += 1;
  proposalEntity.vote_count += 1;
  proposalEntity.scores_total = (
    BigInt(proposalEntity.scores_total || '0') + BigInt(vp)
  ).toString();
  proposalEntity[`scores_${choice}`] = (
    BigInt(proposalEntity[`scores_${choice}`] || '0') + BigInt(vp)
  ).toString();

  vote.voter = voter;
  vote.space = space;
  vote.proposal = proposalId;
  vote.choice = choice;
  vote.vp = vp;
  vote.created = timestamp;
  vote.chain_id = chainId;
  vote.sig = sig;

  await Promise.all([
    userEntity.save(),
    spaceEntity.save(),
    proposalEntity.save(),
    vote.save()
  ]);
};
