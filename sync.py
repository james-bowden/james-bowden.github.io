from glob import glob
import os
import re
import shutil

VAULT_PATH = '/Users/jcbowden/Documents/Obsidian Vault'
SITE_PATH = 'james-bowden.github.io'
DIR_PATH = f'{VAULT_PATH}/{SITE_PATH}/pages/vault'
URL = f'https://{SITE_PATH}/pages/vault'

SKIPS_INDEX = [
	'img',
	'javascripts',
	'dne.md',
]

def sync(original_path, pub_path, verbose=False):
	if verbose: print(f'{original_path} --> {pub_path}')
	title = original_path.split('/')[-1]
	shutil.copy(original_path, f'{DIR_PATH}/{pub_path}/{title}')

def edit_layout(path):
	if '_index_' in path: return
	try:
		with open(path, 'r', encoding='utf-8') as source_file:
			content = source_file.readlines()
		if len(content) == 0: return

		insert = 'layout: obs'

		# Check if layout is already set to obs
		for line in content:
			if insert in line:
				return
				
		# Create new content with desired layout
		if '---' not in content[0]:
			new_content = [f"---\n{insert}\n---\n\n"] + content
		else:
			new_content = [content[0]] + [f"{insert}\n"] + content[1:]
		
		# (over)Write to target file
		assert len(new_content) > 0
		with open(path, 'w', encoding='utf-8') as target_file:
		    target_file.writelines(new_content)
		
	except FileNotFoundError:
		print(f"Error: Could not find {path}")
	except Exception as e:
		print(f"An error occurred: {str(e)}")
		print(path)

def add_backlink(path):
	if '_index_' in path: return
	try:
		with open(path, 'r', encoding='utf-8') as source_file:
			content = source_file.readlines()
		if len(content) == 0: return

		if 'index' in path: # pop off index.md and current directory
			backlink = '/'.join(path.replace(DIR_PATH, URL).split('/')[:-2])
		else: # pop off current file
			backlink = '/'.join(path.replace(DIR_PATH, URL).split('/')[:-1])
		insert = f'backlink: {backlink}'

		# Check if layout is already set to obs
		exists = False
		for i, line in enumerate(content):
			if 'backlink: ' in line:
				content[i] = f'{insert}\n'
				exists = True
				break

		if not exists:
			# Create new content with desired layout
			if '---' not in content[0]:
				new_content = [f"---\n{insert}\n---\n\n"] + content
			else:
				new_content = [content[0]] + [f"{insert}\n"] + content[1:]
		else:
			new_content = content
		
		# (over)Write to target file
		assert len(new_content) > 0
		with open(path, 'w', encoding='utf-8') as target_file:
		    target_file.writelines(new_content)
		
	except FileNotFoundError:
		print(f"Error: Could not find {path}")
	except Exception as e:
		print(f"An error occurred: {str(e)}")
		print(path)

def write_index(source):
	dest = '/'.join(source.split('/')[:-1]) + '/index.md'
	title = source.split('/')[-1].split('_')[-1].split('.')[0] # _index_title.md

	try:
		with open(source, 'r', encoding='utf-8') as source_file:
			content = source_file.readlines()

		# Create new content with title
		new_content = [f"## {title}\n\n"]

		dirs, files = [], []
		for line in content:
			if '|index]]' in line: continue
			if '[[' in line:
				skip = False
				for pattern in SKIPS_INDEX:
					if pattern in line: skip = True
				if skip: continue
				link = line.split('|')[0].replace('[[', '').replace(']]', '').replace(SITE_PATH, '').strip().strip('/')
				if '/_index_' in link:
					link = link.split('/')[-2]
				else: # relative path for files means only have to specify the file name
					link = link.split('/')[-1] 
				text = line.split('|')[1].replace('[[', '').replace(']]', '').replace('/n', '').strip()
				if text[0] == '^':
					text = f'**{text[1:]}**'
				if '_index_' in text:
					text = text.replace('_index_', '')
					dirs.append(f'[**{text}**]({link})\n\n')
				else:
					files.append(f'[{text}]({link})\n\n')

		if len(dirs) > 0 and len(files) > 0:
			dirs.append('---\n\n')

		new_content += dirs + files # dirs go first

		# print(dest)

		# print(new_content)
		
		# Write to target file
		with open(dest, 'w', encoding='utf-8') as target_file:
		    target_file.writelines(new_content)
		
	except FileNotFoundError:
		print(f"Error: Could not find {source}")
	except Exception as e:
		print(f"An error occurred: {str(e)}")

def add_anchors(path):
	if '_index_' in path or '/index.md' in path: return
	try:
		with open(path, 'r', encoding='utf-8') as source_file:
			content = source_file.readlines()
		if len(content) == 0: return
		
		# just assume no reusing of anchors, makes a headache for pattern matching to them later.
		# used_anchors = set()
		pattern = r'\^[a-zA-Z0-9]+$|\^[a-zA-Z0-9]+\n' # for lil carrots which must end the line

		for i, line in enumerate(content):
			if line[0] == '#':
				sp = line.find(' ') # index of first space after #, ####...
				anchor = line.replace('#', '').strip().replace(' ', '-')
				# if anchor in used_anchors:
				# 	for i in range(1, 100):
				# 		sugg = anchor + '-' + str(i)
				# 		if sugg not in used_anchors:
				# 			anchor = sugg
				# 			used_anchors.add(anchor)
				# 			break

				# content[i] = f'{line[:sp+1]}<a name="{anchor}"></a>{line[sp:]}'
				content[i] = f'<a name="{anchor}"></a>\n{line}'
				continue
			match = re.search(pattern, line, re.MULTILINE)
			if match:
				anchor = match.group().replace('^', '').strip('\n')
				content[i] = f'{line[:match.start()]} <a name="{anchor}"></a><br>'
		
		# (over)Write to target file
		assert len(content) > 0
		with open(path, 'w', encoding='utf-8') as target_file:
		    target_file.writelines(content)
		
	except FileNotFoundError:
		print(f"Error: Could not find {path}")
	except Exception as e:
		print(f"An error occurred: {str(e)}")
		print(path)

def handle_link(path, s):
	# internal link: [[#heading]] or [[#^tag]]; assume linked to #head-ing or #tag
	if s[2] == '#':
		if s[3] == '^':
			link = s[4:].strip(']')
		else:
			link = s[3:].strip(']').replace(' ', '-') # see add_anchors function
		if s.split('|') == 2:
			text = s.split('|')[-1].replace(']]', '')
		else:
			text = link
		return f'[{text}](#{link})'

	# format [[link|text]] --> [text](link) if exists as an atom
	# TODO: replace dne.md for cases where link exists as another atom
	if len(s.split('|')) == 1:
		link = s.replace('[[', '').replace(']]', '')
		return f'[{link}](dne.md)'
	else: # len == 2
		link, text = s.replace('[[', '').replace(']]', '').split('|')
		return f'[{text}](dne.md)'


def handle_image(path, title, s):
	# format [[path.png|100]] --> [path](img/path.png)
	embed = s.replace('[[', '').replace(']]', '').split('|')[0]

	# Copy image to repo
	os.makedirs(f'{path}/img', exist_ok=True)
	img_path_search = glob(f'{VAULT_PATH}/**/{title}', recursive=True)
	for p in img_path_search:
		if SITE_PATH in p:
			continue
		else:
			img_path = '/'.join(p.split(title)[:-1])
	shutil.copy(f'{img_path}/img/{embed}', f'{path}/img/{embed}')

	return f'[image](img/{embed})'


def handle_embeds(path):
	if '_index_' in path or '/index.md' in path: return
	try:
		with open(path, 'r', encoding='utf-8') as source_file:
			content = source_file.read()
		if len(content) == 0: return
		
		parent_dir = '/'.join(path.split('/')[:-1])
		title = path.split('/')[-1]

		# find embeds (links, images); leave ! as is. 
		pattern = r'\[\[.*?\]\]'
		new_content = ''
		last_match_ind = 0
		for match in re.finditer(pattern, content): # has group (str), start, end, span (tuple start end)
			if '.png' in match.group() or '.jpg' in match.group():
				repl = handle_image(parent_dir, title, match.group())
			else:
				repl = handle_link(parent_dir, match.group())
			new_content += content[last_match_ind:match.start()] + repl
			last_match_ind = match.end()
			
		new_content += content[last_match_ind:]
		
		# (over)Write to target file
		assert len(new_content) > 0
		with open(path, 'w', encoding='utf-8') as target_file:
		    target_file.writelines(new_content)
		
	except FileNotFoundError:
		print(f"Error: Could not find {path}")
	except Exception as e:
		print(f"An error occurred: {str(e)}; path: {path}")
	

def sync_index(verbose=False):
	fnames = glob(f'{DIR_PATH}/**/_index_*', recursive=True)
	if verbose: print(fnames)
	for f in fnames:
		write_index(f)

def sync_atomic(verbose=False):
	fnames = glob(f'{VAULT_PATH}/**/_a_*', recursive=True)
	if verbose: print(fnames)
	for f in fnames:
		if DIR_PATH in f: continue
		# in atomic folder, don't need _a_ tag too
		shutil.copy(f, f"{DIR_PATH}/atomic/{f.split('/')[-1].replace('_a_', '')}")
		# mine any assets that should be included, and copy over too.


def convert_math_delimiters(text):
    # First, replace $$ math $$ with \n$$\n math \n$$\n
    # We need to do this first to avoid interfering with the single $ conversion
    text = re.sub(r'\$\$(.*?)\$\$', r'\n$$\n\1\n$$\n', text, flags=re.DOTALL)
    
    # Then replace single $ math $ with $$ math $$
    text = re.sub(r'(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)', r'$$\1$$', text, flags=re.DOTALL)
    
    return text

# Example usage:
def process_markdown_file(input_file_path, output_file_path=None):
    # If no output path is specified, overwrite the input file
    if output_file_path is None:
        output_file_path = input_file_path
    
    # Read the file
    with open(input_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Convert the delimiters
    converted_content = convert_math_delimiters(content)
    
    # Write the result
    with open(output_file_path, 'w', encoding='utf-8') as file:
        file.write(converted_content)

# Usage example:
# process_markdown_file('input.md', 'output.md')
# or to overwrite the same file:
# process_markdown_file('input.md')

if __name__ == "__main__":
	# Moving files into repo
	sync_atomic()
	sync_index()

	# maybe make a separate csv that gets edited?
	sync(f'{VAULT_PATH}/__ref/yogas.md', 'lists')
	sync(f'{VAULT_PATH}/__ref/Engagement Queue.md', 'lists')
	sync(f'{VAULT_PATH}/__ref/Humanities Engagement List.md', 'lists')
	sync(f'{VAULT_PATH}/__ref/Recipes.md', 'lists')

	# Formatting files
	[edit_layout(f) for f in glob(f'{DIR_PATH}/**/*.md', recursive=True)]
	[add_backlink(f) for f in glob(f'{DIR_PATH}/**/*.md', recursive=True)]
	[handle_embeds(f) for f in glob(f'{DIR_PATH}/**/*.md', recursive=True)]

	print('\tdone syncing :p')
