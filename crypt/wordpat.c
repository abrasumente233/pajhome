/***********************************************************************CMOD**
 * A utility to calculate character patterns of words and dictionaries.
 * Copyright Paul Johnston, 1999 - 2000. See legal.html for details.
 *****************************************************************************/

#include <stdio.h>
#include <string.h>
#include <ctype.h>

/*****************************************************************************
 * Global constants
 *****************************************************************************/
#define MAX_OPEN 30
#define MAX_LEN 256
#define DOT_PERIOD 500
const char *base26 = "0123456789ABCDEFGHIJKLMNOP";

/*****************************************************************************
 * Function prototypes
 *****************************************************************************/
void tidy_word(char *word);
int word_pat(const char *word, char *pat);
int proc_dict(const char *dict_name, int longest_word);
void sort_words(int longest_word);

/*****************************************************************************
 * main - main entry point; interpret command line and call support routines
 *****************************************************************************/
int main(int argc, char *argv[])
{
  char word[MAX_LEN];
  char patt[MAX_LEN];
  int longest_word;
  int ii;

  printf ("\nWord Pattern Calculator, by Paul Johnston\n\n");

  /***************************************************************************
   * If there are no command line arguments, prompt user for a single word
   ***************************************************************************/
  if (argc == 1)
  {
    printf ("Enter word: ");
    fgets (word, MAX_LEN - 1, stdin);
    tidy_word(word);
    word_pat(word, patt);
    printf ("Pattern: %s\n", patt);
  }

  /***************************************************************************
   * Otherwise, command line is a list of dictionary files. Call proc_dict
   * for each dictionary, remembering the longest word of all of them. Then
   * call sort_words to compile the lot.
   ***************************************************************************/
  else
  {
    longest_word = 0;
    for (ii = 1; ii < argc; ii++)
    {
      printf("%s ", argv[ii]);
      longest_word = proc_dict(argv[ii], longest_word);
      printf("\n");
    }
    printf ("Sorting ");
    sort_words(longest_word);
    printf ("\n");
  }

  printf("\n");

  return 0;
}


/*****************************************************************************
 * tidy_word - strips non alphabetic characters and puts word into upper case
 *****************************************************************************/
void tidy_word(char *word)
{
  int ii, jj = 0;

  for (ii = 0; word[ii]; ii++)
  {
    if(isalpha(word[ii]))
    {
      word[jj++] = toupper(word[ii]);
    }
  }
  word[jj] = 0;
}


/*****************************************************************************
 * word_pat - calculate the pattern for word, and place in pat. For example:
 *    ABBA       4-1221
 *    COMPUTER   8-12345678
 *    IT         2-12
 *****************************************************************************/
int word_pat(const char *word, char *pat)
{
  char chars[26];
  int uniq_chrs;
  int pat_len;
  int ii;

  /***************************************************************************
   * chars is an array which stores the position of the first occurance of an
   * 'A' or a 'B' and so on.
   ***************************************************************************/
  memset (chars, 0, sizeof(chars));
  uniq_chrs = 0;

  /***************************************************************************
   * pattern begins "length-"
   ***************************************************************************/
  sprintf(pat, "%d-", strlen(word));
  pat_len = strlen(pat);

  /***************************************************************************
   * Loop through each character in the word
   ***************************************************************************/
  for (ii = 0; word[ii]; ii++)
  {
    /*************************************************************************
     * If this character not yet encountered, then record position
     *************************************************************************/
    if (chars[word[ii] - 'A'] == 0)
    {
      uniq_chrs++;
      chars[word[ii] - 'A'] = base26[uniq_chrs];
    }
    /*************************************************************************
     * Output position of first occurance of this character
     *************************************************************************/
    pat[pat_len] = chars[word[ii] - 'A'];
    pat_len++;
  }
  pat[pat_len] = 0;

  /***************************************************************************
   * Return length of word
   ***************************************************************************/
  return ii;
}


/*****************************************************************************
 * proc_dict - this takes a file with one word on each line, and calculates
 * the pattern of each word. The output is place in separate files based on
 * the length of the word - 1.rwl ... <n>.rwl - with each line taking the
 * format "PATTERN WORD".
 *****************************************************************************/
int proc_dict(const char *dict_name, int longest_word)
{
  char word[MAX_LEN];
  char pat[MAX_LEN];
  int word_len;
  int do_dot;
  int ii;
  FILE *dict_file;
  FILE *long_file;
  FILE *out_file[MAX_OPEN];
  char file_name[MAX_LEN];

  /***************************************************************************
   * Start by nulling out file handles, so we don't try to close them on an
   * early error.
   ***************************************************************************/
  for (ii = 0; ii < MAX_OPEN; ii++)
  {
    out_file[ii] = NULL;
  }

  /***************************************************************************
   * Open the dictionary file for reading
   ***************************************************************************/
  dict_file = fopen(dict_name, "rt");
  if (dict_file == NULL)
  {
    printf("\nERROR: Failed to open '%s' for reading\n", dict_name);
    goto ERROR;
  }

  /***************************************************************************
   * Open the output files
   ***************************************************************************/
  for (ii = 1; ii < MAX_OPEN; ii++)
  {
    sprintf(file_name, "%d.rwl", ii);
    out_file[ii] = fopen (file_name, "at");
    if(out_file[ii] == NULL)
    {
      printf("\nERROR: Failed to open '%s' for appending\n", file_name);
      goto ERROR;
    }
  }

  /***************************************************************************
   * Loop through each line of the dictionary file
   ***************************************************************************/
  for(;;)
  {
    fgets(word, MAX_LEN - 1, dict_file);
    if (feof(dict_file))
    {
      break;
    }

    /*************************************************************************
     * Tidy up word, calculate pattern and keep track of longest word so far.
     *************************************************************************/
    tidy_word(word);
    word_len = word_pat(word, pat);
    longest_word = word_len > longest_word ? word_len : longest_word;

    /*************************************************************************
     * Skip zero length words
     *************************************************************************/
    if (word_len == 0)
    {
      continue;
    }

    /*************************************************************************
     * Write the pattern and word to an output file. If the word is short,
     * this file will already be open; otherwise we have to open and close it
     * now.
     *************************************************************************/
    if (word_len < MAX_OPEN)
    {
      fprintf (out_file[word_len], "%s %s\n", pat, word);
    }
    else
    {
      sprintf(file_name, "%d.rwl", word_len);
      long_file = fopen (file_name, "at");
      if(long_file == NULL)
      {
        printf("\nERROR: Failed to open '%s' for appending\n", file_name);
        goto ERROR;
      }
      fprintf (long_file, "%s %s\n", pat, word);
      fclose(long_file);
    }

    /*************************************************************************
     * Update display periodically to show that something is happening
     *************************************************************************/
    if (do_dot == 0)
    {
      fputc('.', stdout);
      fflush(stdout);
    }
    do_dot = (do_dot + 1) % DOT_PERIOD;
  }

ERROR:
  /***************************************************************************
   * Close the output files
   ***************************************************************************/
  for (ii = 1; ii < MAX_OPEN; ii++)
  {
    if(out_file[ii] != NULL)
    {
      fclose(out_file[ii]);
    }
  }
  if(dict_file != NULL)
  {
    fclose(dict_file);
  }

  /***************************************************************************
   * Return the length of the longest word encountered
   ***************************************************************************/
  return longest_word;
}


/*****************************************************************************
 * sort_words - This formats the *.rwl files, making *.wl files. Firstly,
 * the external sort program is used to make *.swl, then these sorted files
 * are reformatted, with duplicate words being removed
 *****************************************************************************/
void sort_words(int longest_word)
{
  FILE *in_file;
  FILE *out_file;
  char file_name[MAX_LEN];
  char prev_word[MAX_LEN];
  char prev_pat[MAX_LEN];
  char pat[MAX_LEN];
  char cmd[MAX_LEN];
  char *word;
  int ii;

  /***************************************************************************
   * Loop through files from 1.rwl to <longest_word>.rwl
   ***************************************************************************/
  for (ii = 1; ii <= longest_word; ii++)
  {

    /*************************************************************************
     * Test to see if the file exists
     *************************************************************************/
    sprintf(file_name, "%d.rwl", ii);
    in_file = fopen (file_name, "rt");
    if(in_file == NULL)
    {
      continue;
    }
    fclose(in_file);

    /*************************************************************************
     * Use external sorting command to sort <ii>.rwl to <ii>.swl
     *************************************************************************/
    sprintf (cmd, "sort <%d.rwl >%d.swl", ii, ii);
    system (cmd);

    /*************************************************************************
     * Update display to show that something is happening
     *************************************************************************/
    fputc('.', stdout);
    fflush(stdout);

    /*************************************************************************
     * Open <ii>.swl for input
     *************************************************************************/
    sprintf (file_name, "%d.swl", ii);
    in_file = fopen (file_name, "rt");
    if (in_file == NULL)
    {
      printf("\nERROR: Failed to open '%s' for reading\n", file_name);
      continue;
    }

    /*************************************************************************
     * Open <ii>.wl for output
     *************************************************************************/
    sprintf (file_name, "%d.wl", ii);
    out_file = fopen (file_name, "wt");
    if (out_file == NULL)
    {
      printf("\nERROR: Failed to open '%s' for writing\n", file_name);
      fclose(in_file);
      continue;
    }

    /*************************************************************************
     * Loop through each line of <ii>.swl
     *************************************************************************/
    for(;;)
    {
      fgets(pat, MAX_LEN - 1, in_file);
      if (feof(in_file))
      {
        break;
      }

      /***********************************************************************
       * Split line into pattern and word
       ***********************************************************************/
      word = strchr(pat, ' ');
      if (word == NULL)
      {
        printf("\nERROR: Malformed line '%s' in sorted file\n", pat);
        continue;
      }
      *word = 0;
      word++;

      /***********************************************************************
       * If this is a duplicate word, then skip it
       ***********************************************************************/
      if (strcmp(prev_word, word) == 0)
      {
        continue;
      }

      /***********************************************************************
       * If this is the same pattern as last, just output word; Otherwise
       * output pattern and word
       ***********************************************************************/
      if (strcmp(prev_pat, pat) == 0)
      {
        fprintf (out_file, "%s", word);
      }
      else
      {
        fprintf (out_file, "%s\n%s", pat, word);
      }

      /***********************************************************************
       * Remember pattern and word
       ***********************************************************************/
      strcpy (prev_pat, pat);
      strcpy (prev_word, word);
    }

    /*************************************************************************
     * Close <ii>.swl and <ii>.wl
     *************************************************************************/
    fclose (out_file);
    fclose (in_file);

    /*************************************************************************
     * Delete <ii>.rwl and <ii>.swl
     *************************************************************************/
    sprintf (file_name, "%d.rwl", ii);
    remove (file_name);
    sprintf (file_name, "%d.swl", ii);
    remove (file_name);

    /*************************************************************************
     * Update display to show that something is happening
     *************************************************************************/
    fputc('.', stdout);
    fflush(stdout);
  }
}
