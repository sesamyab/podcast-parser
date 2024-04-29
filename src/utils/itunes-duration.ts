export function toSeconds(itunesDuration: string | number) {
  const segments = itunesDuration.toString().split(':');
  let duration = 0;
  segments.forEach((segment, index) => {
    duration += parseInt(segment, 10) * Math.pow(60, segments.length - index - 1);
  });

  return duration;
}
