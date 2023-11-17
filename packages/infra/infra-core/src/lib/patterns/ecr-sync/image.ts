/**
 * Properties of a EcrSync image.
 */
export interface Image {

  /**
   * The name of the image that should be proxied by ECR
   *
   */
  readonly imageName: string;

  /**
   * A list of regular expression which tags should be included.
   * Only one of the defined tags must match.
   *
   * If excludeTags is also defined, excludeTags wins.
   *
   * @default Emtpy. All tags are included
   */
  readonly includeTags?: string[];

  /**
   * A list of regular expression which tags should be included.
   * Only one of the defined tags must match.
   *
   * If includeTags is also defined, excludeTags wins.
   *
   * @default Empty. No tags are excluded
   */
  readonly excludeTags?: string[];
}
