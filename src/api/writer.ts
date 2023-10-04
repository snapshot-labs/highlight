import { formatUnits } from '@ethersproject/units';
import {
  Category,
  Topic,
  TopicVote,
  User,
  Profile,
  Statement,
  Vote
} from '../../.checkpoint/models';
import { getJSON } from '../utils';
import { getEntity, getStorage } from './utils';

/* Discussions */

export const handleAddCategory = async ({ payload }) => {
  console.log('Handle add category', payload);

  const [id, parent, metadataURI] = payload.data;

  const category = new Category(id);
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
    const parentCategory = await Category.loadEntity(category.parent);

    if (parentCategory) {
      parentCategory.category_count += 1;

      await parentCategory.save();
    }
  }
};

export const handleEditCategory = async ({ payload }) => {
  console.log('Handle edit category', payload);

  const [id, metadataURI] = payload.data;

  const category = await Category.loadEntity(id);

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

export const handleRemoveCategory = async ({ payload }) => {
  console.log('Handle remove category', payload);

  const [id] = payload.data;

  const category = await Category.loadEntity(id);

  if (category) {
    const parent = category.parent || 0;

    if (parent !== 0) {
      const parentCategory = await Category.loadEntity(parent);

      if (parentCategory) {
        parentCategory.category_count -= 1;

        await parentCategory.save();
      }
    }

    await category.delete();
  }
};

export const handleAddTopic = async ({ payload }) => {
  console.log('Handle add topic', payload);

  const [id, author, categoryId, parent, metadataUri] = payload.data;

  const topic = new Topic(id);
  topic.category = categoryId;
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
    const parentTopic = await Topic.loadEntity(parent);

    if (parentTopic) {
      parentTopic.reply_count += 1;

      await parentTopic.save();
    }
  } else {
    const category = await Category.loadEntity(categoryId);
    if (category) {
      category.topic_count += 1;

      await category.save();
    }
  }

  const user: User = await getEntity(User, author);
  const profile: Profile = await getEntity(Profile, author);

  user.profile = author;
  user.topic_count += 1;
  profile.user = author;

  await user.save();
  await profile.save();
};

export const handleEditTopic = async ({ payload }) => {
  console.log('Handle edit topic', payload);

  const [id, metadataURI] = payload.data;

  const topic = await Topic.loadEntity(id);

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

export const handleRemoveTopic = async ({ payload }) => {
  console.log('Handle remove topic', payload);

  const [id] = payload.data;

  const topic = await Topic.loadEntity(id);

  if (topic) {
    await topic.delete();
  }
};

export const handlePinTopic = async ({ payload }) => {
  console.log('Handle pin topic', payload);

  const [id] = payload.data;

  const topic = await Topic.loadEntity(id);

  if (topic) {
    topic.pinned = true;

    await topic.save();
  }
};

export const handleUnpinTopic = async ({ payload }) => {
  console.log('Handle unpin topic', payload);

  const [id] = payload.data;

  const topic = await Topic.loadEntity(id);

  if (topic) {
    topic.pinned = false;

    await topic.save();
  }
};

export const handleTopicVote = async ({ payload }) => {
  console.log('Handle topic vote', payload);

  const [voter, topicId, choice] = payload.data;
  const id = `${voter}/${topicId}`;
  let newVote = false;
  let previousVoteChoice;

  let vote = await TopicVote.loadEntity(id);
  if (!vote) {
    vote = new TopicVote(id);
    newVote = true;
  } else {
    previousVoteChoice = vote.choice;
  }
  vote.voter = voter;
  vote.topic = topicId;
  vote.choice = choice;

  await vote.save();

  const topic = await Topic.loadEntity(topicId);

  if (topic) {
    topic.score += choice;
    if (newVote) {
      topic.vote_count += 1;
    } else {
      topic.score -= previousVoteChoice;
    }

    await topic.save();
  }

  const user: User = await getEntity(User, voter);
  const profile: Profile = await getEntity(Profile, voter);

  user.profile = voter;
  user.topic_vote_count += 1;
  profile.user = voter;

  await user.save();
  await profile.save();
};

export const handleTopicUnvote = async ({ payload }) => {
  console.log('Handle topic unvote', payload);

  const [voter, topic] = payload.data;
  const id = `${voter}/${topic}`;

  const vote = await TopicVote.loadEntity(id);

  if (vote) {
    await vote.delete();
  }

  const user: User = await getEntity(User, voter);
  const profile: Profile = await getEntity(Profile, voter);

  user.profile = voter;
  user.topic_vote_count -= 1;
  profile.user = voter;

  await user.save();
  await profile.save();
};

/* Profiles */

export const handleSetProfile = async ({ payload }) => {
  console.log('Handle set profile', payload);

  const [id, metadataUri] = payload.data;

  const user: User = await getEntity(User, id);
  const profile: Profile = await getEntity(Profile, id);

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

export const handleSetStatement = async ({ payload }) => {
  console.log('Handle set statement', payload);

  const [id, org, metadataUri] = payload.data;

  const user: User = await getEntity(User, id);
  const statement: Statement = await getEntity(Statement, `${id}/${org}`);

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

export const handleVote = async ({ payload }) => {
  console.log('Handle vote', payload);

  const [space, voter, proposalId, choice, chainId, sig] = payload.data;
  const id = `${space}/${proposalId}/${voter}`;

  // Get voting power
  const contract = '0xF524a5E0E153506b70994a2e01a890858728Bcd9';
  const index = 0;
  const blockNum = 9552533;

  const storage = await getStorage(contract, index, blockNum, 5, voter);

  const vote: Vote = await getEntity(Vote, id);

  vote.voter = voter;
  vote.space = space;
  vote.proposal = proposalId;
  vote.choice = choice;
  vote.vp = parseFloat(formatUnits(storage, 18));
  vote.vp_raw = storage;
  vote.created = ~~(Date.now() / 1e3); // @TODO change to unit timestamp
  vote.chain_id = chainId;
  vote.sig = sig;

  await vote.save();
};
