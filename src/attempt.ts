import _ from 'lodash';

export default (
  available: number[],
  allowed: (number | 'any')[],
  preferred: (number | 'any')[],
): number[] => {
  const allowedWithoutAny = replaceAnyInAllowed(allowed, available);

  const identical = _.intersection(available, allowedWithoutAny);

  const preferredWithoutAny = replaceAnyInPreferred(preferred, identical);

  const firstResult = _.intersection(preferredWithoutAny, identical);

  const allowedNext = _.difference(identical, preferredWithoutAny);
  const preferredNext = _.difference(preferredWithoutAny, identical);

  const result = preferredNext.map((allowValue) => {
    const largerValues = allowedNext.map((prefValue) => {
      if (allowValue < prefValue) {
        return prefValue;
      }
    });

    const smallValues = allowedNext.map((prefValue) => {
      if (allowValue > prefValue) {
        return prefValue;
      }
    });
    const largerValue = _.min(largerValues);
    const smallValue = _.max(smallValues);

    if (largerValue && smallValue) {
      if (+allowValue - +smallValue > +largerValue - +allowValue) {
        return largerValue;
      } else {
        return smallValue;
      }
    }

    return largerValue || smallValue;
  });

  return _(<Array<number>>[...firstResult, ...result])
    .compact()
    .uniq()
    .value();
};

const replaceAnyInAllowed = (
  allowed: (number | 'any')[],
  available: number[],
): number[] =>
  allowed.map((value) => {
    if (value === 'any') {
      const temp = _.difference(available, <Array<number>>allowed);
      return temp[_.random(0, temp.length - 1)];
    }
    return value;
  });

const replaceAnyInPreferred = (
  preferred: (number | 'any')[],
  identical: number[],
): number[] => {
  const temp = preferred.map((value) => {
    if (value === 'any') {
      return identical;
    }
    return value;
  });
  return _(temp).flatten().uniq().value();
};
