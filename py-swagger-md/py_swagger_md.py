import json
import requests
from pprint import pprint

def print_parameters(target, resource):
    target.write('#### Parameters')
    target.write("\n")

    params = resource['parameters']

    for param in params:
        desc = ''

        if 'description' in param:
            desc = param['description']

        target.write('* %s - %s - %s - %s' % (param['name'], param['in'], param['required'], desc))
        target.write("\n")

def print_schema(target, schema, print_tabs=1):
    if '$ref' in schema:
        obj_def = schema['$ref'].split('/')

        obj_props = defs[obj_def[2]]['properties']

        for obj_prop in obj_props:
            if 'items' in obj_props[obj_prop]:
                target.write('\t%s:\n' % (obj_prop))
                target.write("\t[\n\t\t{\n")
                items = obj_props[obj_prop]['items']
                print_schema(target, items, print_tabs=3)
                target.write("\t\t}\n\t]\n")
            else:
                tab_val = "\t" * print_tabs
                target.write('%s%s:%s' % (tab_val, obj_prop, obj_props[obj_prop]['type']))
                target.write("\n")

def print_response(target, resource):
    target.write('#### Response')
    target.write("\n")

    resps = resource['responses']

    for resp in resps:
        desc = ''

        if 'description' in resps[resp]:
            desc = resps[resp]['description']

        target.write('* %s - %s' % (resp, desc))
        target.write("\n")

        if 'schema' in resps[resp]:
            target.write("```json\n{\n")
            print_schema(target, resps[resp]['schema'])
            target.write("}\n```")

        target.write("\n")

def print_resource(target, resource, defs):

    summary = resource['summary'].split('\n')

    for line in summary:
        target.write('%s' % line.lstrip())

    target.write("\n")

    if 'description' in resource:
        target.write("#### Implementation Notes\n")
        desc = resource['description'].split('\n')

        for line in desc:
            target.write('>%s\n' % line.lstrip())

        target.write("\n")

    print_parameters(target, resource)

    print_response(target, resource)

r = requests.get('http://tri-tspiw-tstv.twi.dom:9000/swagger/docs/v1/')

json_data=r.text

data = json.loads(json_data)

info = data['info']

target = open("output.md", 'w')

target.write('# %s' % info['title'] )
target.write("\n")
target.write('%s' % info['description'] )
target.write("\n")

defs = data['definitions']

for path in data['paths']:
    target.write('## %s' % path )
    target.write("\n")

    resource = data['paths'][path]

    if 'get' in resource:
        target.write('### GET\n')
        print_resource(target, resource['get'], defs)
        target.write("\n")

    if 'post' in resource:
        target.write('### POST\n')
        print_resource(target, resource['post'], defs)
        target.write("\n")

    if 'put' in resource:
        target.write('### PUT\n')
        print_resource(target, resource['put'],defs)
        target.write("\n")

    target.write("\n")
